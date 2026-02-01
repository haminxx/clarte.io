# clarte_claude_nlp.py
# Claude/Gemini (deep Socratic questioning) + Exa Research + HelixDB Memory

import anthropic
import os
import requests
import re
import time

# Try to import Gemini SDK
try:
    import google.generativeai as genai
    GEMINI_SDK_AVAILABLE = True
except ImportError:
    GEMINI_SDK_AVAILABLE = False

# HelixDB Memory Integration (optional)
# Set to False to disable HelixDB completely
HELIXDB_ENABLED_BY_DEFAULT = os.getenv("HELIXDB_ENABLED", "true").lower() == "true"

try:
    if HELIXDB_ENABLED_BY_DEFAULT:
        from helixdb_client import (
            is_available as helixdb_available,
            get_user_name,
            set_user_name,
            get_user_profile,
            add_user_goal,
            add_user_fear,
            remember,
            recall,
            get_recent_memories,
            save_conversation_turn,
            get_conversation_context,
            initialize as init_helixdb
        )
        HELIXDB_LOADED = True
    else:
        HELIXDB_LOADED = False
except ImportError:
    HELIXDB_LOADED = False
    if HELIXDB_ENABLED_BY_DEFAULT:
        print("[INFO] HelixDB client not available - memory features disabled")

# ←←← API keys: set via environment variables (do not commit secrets) ←←←
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
EXA_API_KEY = os.getenv("EXA_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

# Initialize Gemini client
GEMINI_AVAILABLE = False
if GEMINI_SDK_AVAILABLE and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
    except Exception as e:
        print(f"[WARN] Gemini API configuration failed: {e}")
        GEMINI_AVAILABLE = False
elif GEMINI_SDK_AVAILABLE and not GEMINI_API_KEY:
    print("[WARN] Gemini API key not set. Set GEMINI_API_KEY environment variable or add it to the code.")
elif not GEMINI_SDK_AVAILABLE:
    print("[WARN] google-generativeai not installed. Install with: pip install google-generativeai")

def detect_research_needs(user_input):
    """Detect if user input needs research (questions, specific topics, etc.)"""
    # Check for question words
    question_words = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'should', 'is', 'are', 'do', 'does']
    has_question = any(user_input.lower().startswith(word) for word in question_words) or '?' in user_input
    
    # Check for specific topics that might need research
    research_keywords = ['depression', 'anxiety', 'stress', 'career', 'relationship', 'health', 'therapy', 
                        'medication', 'treatment', 'cure', 'solution', 'help', 'advice', 'how to', 
                        'what is', 'why do', 'causes', 'symptoms', 'effects', 'major', 'university',
                        'college', 'degree', 'job', 'opportunity', 'salary']
    has_keywords = any(keyword in user_input.lower() for keyword in research_keywords)
    
    return has_question or has_keywords

def research_with_exa_answer(query):
    """Use Exa /answer endpoint for direct answers"""
    if not EXA_API_KEY:
        return None
    
    try:
        url = "https://api.exa.ai/answer"
        headers = {
            "x-api-key": EXA_API_KEY,
            "Content-Type": "application/json"
        }
        data = {
            "query": query,
            "num_sources": 3,
            "text": {
                "max_characters": 300
            }
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=15)
        if response.status_code == 200:
            result = response.json()
            answer = result.get('answer', '')
            if answer:
                return answer[:300]  # Limit to 300 chars for context
    except Exception as e:
        print(f"[WARN] Exa /answer failed: {e}")
    
    return None

def research_with_exa_research(query):
    """Use Exa /research endpoint for in-depth research"""
    if not EXA_API_KEY:
        return None
    
    try:
        url = "https://api.exa.ai/research"
        headers = {
            "x-api-key": EXA_API_KEY,
            "Content-Type": "application/json"
        }
        data = {
            "query": query,
            "num_results": 5,
            "text": {
                "max_characters": 200
            }
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=20)
        if response.status_code == 200:
            result = response.json()
            # Extract key findings from research
            findings = []
            for item in result.get('results', [])[:3]:  # Top 3 findings
                text = item.get('text', '')
                if text:
                    findings.append(text[:150])
            return " | ".join(findings) if findings else None
    except Exception as e:
        print(f"[WARN] Exa /research failed: {e}")
    
    return None

def research_with_exa_search(query):
    """Use Exa /search endpoint for basic search"""
    if not EXA_API_KEY:
        return None
    
    try:
        url = "https://api.exa.ai/search"
        headers = {
            "x-api-key": EXA_API_KEY,
            "Content-Type": "application/json"
        }
        data = {
            "query": query,
            "num_results": 3,
            "contents": {
                "text": {"max_characters": 200}
            }
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            summaries = []
            for item in result.get('results', [])[:2]:
                text = item.get('text', '')
                if text:
                    summaries.append(text[:150])
            return " | ".join(summaries) if summaries else None
    except Exception as e:
        print(f"[WARN] Exa /search failed: {e}")
    
    return None

def research_with_exa(query):
    """Smart research using multiple Exa endpoints - tries /answer, /research, /search in order"""
    if not EXA_API_KEY:
        return None
    
    research_result = None
    
    # Strategy: Try /answer first (best for direct questions)
    if '?' in query or any(word in query.lower() for word in ['what', 'how', 'why', 'when', 'where', 'who', 'which']):
        print("[RESEARCH] Using Exa /answer endpoint...")
        research_result = research_with_exa_answer(query)
        if research_result:
            return research_result
    
    # Try /research for in-depth topics
    print("[RESEARCH] Using Exa /research endpoint...")
    research_result = research_with_exa_research(query)
    if research_result:
        return research_result
    
    # Fallback to /search
    print("[RESEARCH] Using Exa /search endpoint...")
    research_result = research_with_exa_search(query)
    if research_result:
        return research_result
    
    return None

def get_research_context(user_input):
    """Get research context from Exa (using multiple Exa endpoints)"""
    research_result = None
    
    # Use Exa with multiple endpoints
    if EXA_API_KEY:
        print("[RESEARCH] Using Exa API (trying /answer, /research, /search)...")
        research_result = research_with_exa(user_input)
    
    return research_result

def decide_model_preference(user_input, research_context=None):
    """
    Decide whether to prioritize speed or quality based on user input and context.
    
    Returns: 'speed' or 'quality'
    """
    # Keywords that suggest user wants quick response
    speed_keywords = ['quick', 'fast', 'quickly', 'asap', 'urgent', 'simple', 'brief', 'short', 'just']
    
    # Keywords that suggest user wants detailed/high-quality response
    quality_keywords = ['explain', 'detailed', 'comprehensive', 'deep', 'thorough', 'analyze', 
                       'complex', 'important', 'critical', 'understand', 'help me understand',
                       'elaborate', 'expand', 'more about', 'tell me more']
    
    user_lower = user_input.lower()
    
    # Check for explicit speed preference
    if any(keyword in user_lower for keyword in speed_keywords):
        return 'speed'
    
    # Check for explicit quality preference
    if any(keyword in user_lower for keyword in quality_keywords):
        return 'quality'
    
    # If research context is complex/long, prefer quality
    if research_context and len(research_context) > 200:
        return 'quality'
    
    # If it's a very simple question, prefer speed
    if len(user_input) < 50 and '?' in user_input and not any(q in user_lower for q in ['why', 'how', 'explain']):
        return 'speed'
    
    # Default: prefer quality for Socratic questioning (needs depth)
    return 'quality'

def get_gemini_model_choice(user_input):
    """
    Determine which Gemini model to use based on user input.
    Returns: 'flash_lite', 'flash', 'flash_2', or 'pro'
    """
    user_lower = user_input.lower()
    
    # Check for explicit model requests
    if 'flash' in user_lower and 'lite' in user_lower:
        return 'flash_lite'
    elif 'flash' in user_lower and '2.0' in user_lower:
        return 'flash_2'
    elif 'flash' in user_lower:
        return 'flash'
    elif 'pro' in user_lower:
        return 'pro'
    
    # Default: None (will be chosen by prefer_speed)
    return None

def call_claude_api(messages, system_prompt):
    """Call Claude API with fallback through multiple models"""
    model_names = [
        "claude-3-haiku-20240307",       # Fastest, most widely available
        "claude-3-sonnet-20240229",      # Balanced
        "claude-3-opus-20240229",         # Most powerful
        "claude-3-5-sonnet-20241022",    # Latest (if you have access)
        "claude-3-5-sonnet",             # Latest without date
    ]
    
    errors = []
    for model_name in model_names:
        try:
            response = client.messages.create(
                model=model_name,
                max_tokens=400,
                temperature=0.9,
                system=system_prompt,
                messages=messages
            )
            return response.content[0].text.strip(), model_name, None
        except Exception as e:
            errors.append(f"  - {model_name}: {str(e)[:100]}")
            continue
    
    return None, None, errors

# Free tier Gemini models (as of 2024)
FREE_TIER_GEMINI_MODELS = {
    "flash_lite": "gemini-2.5-flash-lite",  # Lightest, fastest free tier model
    "flash": "gemini-2.5-flash",            # Fast free tier model
    "flash_2": "gemini-2.0-flash",          # Flash 2.0 version
    "pro": "gemini-2.5-pro",                # Higher quality free tier model
}

def call_gemini_api(messages, system_prompt, prefer_speed=True, model_choice=None):
    """
    Call Gemini API using free tier compatible models
    
    Args:
        messages: Conversation messages
        system_prompt: System prompt
        prefer_speed: If True, prefer faster model (flash), else prefer quality (pro)
        model_choice: Specific model to use ('flash', 'pro', 'pro_latest', 'flash_latest')
                     If None, chooses based on prefer_speed
    """
    if not GEMINI_AVAILABLE:
        return None, None, "Gemini not available"
    
    try:
        # Choose model based on preference or explicit choice
        if model_choice and model_choice in FREE_TIER_GEMINI_MODELS:
            model_name = FREE_TIER_GEMINI_MODELS[model_choice]
        elif prefer_speed:
            # Use Flash Lite for speed (fastest free tier model)
            model_name = FREE_TIER_GEMINI_MODELS["flash_lite"]
        else:
            # Use Pro for quality (free tier compatible)
            model_name = FREE_TIER_GEMINI_MODELS["pro"]
        
        # Convert messages format for Gemini
        # Gemini uses different format - combine system prompt with messages
        prompt_parts = []
        
        # Add system prompt as first part
        prompt_parts.append(system_prompt + "\n\n")
        
        # Add conversation history
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            if role == "user":
                prompt_parts.append(f"User: {content}\n")
            elif role == "assistant":
                prompt_parts.append(f"Assistant: {content}\n")
        
        full_prompt = "".join(prompt_parts)
        
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            full_prompt,
            generation_config={
                "max_output_tokens": 400,
                "temperature": 0.9,
            }
        )
        
        return response.text.strip(), model_name, None
        
    except Exception as e:
        return None, None, str(e)

# Initialize HelixDB if available (must be before we use USE_HELIXDB)
if HELIXDB_LOADED:
    init_helixdb()
    USE_HELIXDB = helixdb_available()
else:
    USE_HELIXDB = False

# Initialize conversation history
# Load from HelixDB if available, otherwise start fresh
if USE_HELIXDB:
    user_name = get_user_name()
    user_profile = get_user_profile()
    
    # Build initial greeting with personalization
    if user_name:
        initial_greeting = f"Hi, {user_name}. What's moving inside you right now?"
    else:
        initial_greeting = "I'm here. What's moving inside you right now?"
    
    # Load recent conversation context
    recent_context = get_conversation_context(max_turns=3)
    if recent_context:
        print(f"[MEMORY] Loading recent context from previous sessions...")
    
    messages = [{"role": "assistant", "content": initial_greeting}]
else:
    messages = [{"role": "assistant", "content": "I'm here. What's moving inside you right now?"}]

# Build system prompt with memory context if available
base_system_prompt = """You are Clarte — a warm but ruthless mirror who combines research with deep Socratic questioning.

When user asks a QUESTION:
1. PRESENT RESEARCH RESULT FIRST: Share the research finding directly, concisely, without fluff. No phrases like "I understand you're curious" - just the facts.
2. ASK ABOUT UNDERLYING CURIOSITY: Ask what caused their curiosity about this question and what's their core concern.

When user shares a STRUGGLE/EMOTION (not a question):
1. EMPATHY FIRST: Acknowledge their struggle, worry, or pain. Make them feel seen.
2. RESEARCH CONTEXT (if available): Share brief research examples as context, not advice.
3. SOCRATIC QUESTION: Ask one piercing question that helps them discover their own truth.

CRITICAL RULES:
- NEVER say "I understand you're curious about..." or "let me see what I can find" - skip all meta-commentary
- NEVER repeat what the user already knows
- When research is provided, present it directly: "According to latest data I found, [research finding]"
- Then: "[Question about their underlying curiosity/concern]"
- Keep responses concise - 3-4 sentences maximum
- Use the user's exact words when possible
- Be gently provocative but compassionate
- Stack every new question on everything said before

Example for QUESTIONS:
"According to latest data I found, [research result]. What sparked your curiosity about this, and what's the core concern behind your question?"

Example for STRUGGLES:
"I hear the weight of [their struggle]. That sounds [emotion]. [Brief research context if available]. What does [their struggle] feel like in your body right now?"
"""

# Add memory context to system prompt if HelixDB is available
if USE_HELIXDB:
    user_profile = get_user_profile()
    recent_memories = get_recent_memories(count=3)
    
    memory_context = ""
    if user_profile.get("name"):
        memory_context += f"\n\nUSER CONTEXT:\n- Name: {user_profile.get('name')}"
    if user_profile.get("goals"):
        memory_context += f"\n- Goals: {', '.join(user_profile.get('goals', []))}"
    if user_profile.get("fears"):
        memory_context += f"\n- Fears: {', '.join(user_profile.get('fears', []))}"
    if recent_memories:
        memory_context += f"\n- Recent memories:\n" + "\n".join(recent_memories)
    if memory_context:
        memory_context += "\n\nUse this context to personalize your responses and reference past conversations when relevant."
    
    system_prompt = base_system_prompt + memory_context
else:
    system_prompt = base_system_prompt

print("\n" + "=" * 70)
print("CLARTE - Socratic Coach with Research")
print("=" * 70)
print("Pipeline: User Input → Exa Research → Claude/Gemini → Text Output")
if USE_HELIXDB:
    print("Memory: HelixDB enabled - conversations will be remembered")
print("\nClarte will:")
print("  • Research topics when you ask questions")
print("  • Use research to inform Socratic questions")
print("  • Choose Claude (quality) or Gemini (speed) based on your input")
print("  • Use free tier Gemini models: gemini-2.5-flash-lite (fast) or gemini-2.5-pro (quality)")
print("  • Respond with text output")
if USE_HELIXDB:
    print("  • Remember conversations across sessions")
    print("  • Personalize responses based on your profile")
print("\n💡 Free Tier Gemini Models Available:")
print("   • flash_lite - gemini-2.5-flash-lite (lightest, fastest)")
print("   • flash - gemini-2.5-flash (fast)")
print("   • flash_2 - gemini-2.0-flash (Flash 2.0)")
print("   • pro - gemini-2.5-pro (higher quality)")
print("\n💡 Free Tier Limits: 5 requests/minute, 25 requests/day")
print("\nType anything. Say 'bye' to stop.\n")
if not EXA_API_KEY:
    print("[INFO] ⚠️  No Exa API key configured. Research features disabled.")
    print("       Add EXA_API_KEY to enable research.\n")
else:
    print("[INFO] ✅ Exa API configured - Research features enabled!\n")
if not GEMINI_AVAILABLE:
    print("[INFO] ⚠️  Gemini API not available. Only Claude will be used.")
    if not GEMINI_SDK_AVAILABLE:
        print("       Install: pip install google-generativeai")
    elif not GEMINI_API_KEY:
        print("       Set GEMINI_API_KEY environment variable or add it to the code.\n")
    else:
        print()
else:
    print("[INFO] ✅ Gemini API configured - Speed/Quality selection enabled!\n")

while True:
    user_input = input("You: ").strip()
    if user_input.lower() in ["bye", "exit", "quit", "stop"]:
        reply = "Until the next layer…"
        print(f"Clarte: {reply}")
        break
    if not user_input:
        continue

    # Step 0: Detect introduction and extract name (if HelixDB available)
    if USE_HELIXDB:
        # Simple name detection patterns
        name_patterns = [
            r"i'?m\s+([A-Z][a-z]+)",  # "I'm Christian"
            r"my\s+name\s+is\s+([A-Z][a-z]+)",  # "My name is Christian"
            r"call\s+me\s+([A-Z][a-z]+)",  # "Call me Christian"
            r"this\s+is\s+([A-Z][a-z]+)",  # "This is Christian"
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                name = match.group(1)
                if len(name) > 1 and name.isalpha():  # Basic validation
                    set_user_name(name)
                    print(f"[MEMORY] ✅ Remembered your name: {name}")
                    break
        
        # Detect goals and fears
        goal_keywords = ["want to", "goal", "trying to", "hope to", "aspire to"]
        fear_keywords = ["afraid of", "fear", "scared of", "worried about", "anxious about"]
        
        if any(keyword in user_input.lower() for keyword in goal_keywords):
            # Extract potential goal (simple heuristic)
            goal_match = re.search(r"(?:want to|goal|trying to|hope to|aspire to)\s+(.+?)(?:\.|$)", user_input, re.IGNORECASE)
            if goal_match:
                goal = goal_match.group(1).strip()
                if len(goal) > 5:  # Basic validation
                    add_user_goal(goal)
                    print(f"[MEMORY] ✅ Saved goal: {goal}")
        
        if any(keyword in user_input.lower() for keyword in fear_keywords):
            # Extract potential fear
            fear_match = re.search(r"(?:afraid of|fear|scared of|worried about|anxious about)\s+(.+?)(?:\.|$)", user_input, re.IGNORECASE)
            if fear_match:
                fear = fear_match.group(1).strip()
                if len(fear) > 5:  # Basic validation
                    add_user_fear(fear)
                    print(f"[MEMORY] ✅ Saved fear: {fear}")

    # Step 1: Check if research is needed and get research context
    research_context = None
    if detect_research_needs(user_input):
        research_context = get_research_context(user_input)
        if research_context:
            print(f"[RESEARCH] Found context: {research_context[:100]}...\n")

    # Step 2: Add user message
    messages.append({"role": "user", "content": user_input})
    
    # Save user message to HelixDB if available
    if USE_HELIXDB:
        save_conversation_turn("user", user_input)
    
    # Step 3: Add research context if available (so Claude can use it)
    if research_context:
        # Check if it's a question (needs research result first format)
        is_question = detect_research_needs(user_input) and ('?' in user_input or 
                    any(word in user_input.lower() for word in ['what', 'how', 'why', 'when', 'where', 'who', 'which']))
        
        if is_question:
            # For questions: present research result directly
            messages.append({
                "role": "user", 
                "content": f"[RESEARCH RESULT - Present this first, then ask about their underlying curiosity]: {research_context}"
            })
        else:
            # For non-questions: use as context
            messages.append({
                "role": "user", 
                "content": f"[Research context: {research_context}]"
            })

    # Step 4: Decide which model to use (speed vs quality)
    preference = decide_model_preference(user_input, research_context)
    gemini_model_choice = get_gemini_model_choice(user_input)
    
    if gemini_model_choice:
        print(f"[MODEL] Preference: {preference} | Gemini model: {gemini_model_choice} ({FREE_TIER_GEMINI_MODELS[gemini_model_choice]})")
    else:
        print(f"[MODEL] Preference: {preference} (speed = faster, quality = deeper)")
    
    response_text = None
    model_used = None
    errors = None
    response_time = None
    
    # Try both APIs based on preference
    if preference == 'speed' and GEMINI_AVAILABLE:
        # Try Gemini first for speed
        print("[MODEL] Trying Gemini Flash Lite (fastest, free tier)...")
        start_time = time.time()
        response_text, model_used, errors = call_gemini_api(messages, system_prompt, prefer_speed=True, model_choice=gemini_model_choice)
        response_time = time.time() - start_time
        
        if response_text:
            print(f"[MODEL] ✅ Gemini ({model_used}) responded in {response_time:.2f}s")
        else:
            print(f"[MODEL] ⚠️  Gemini failed: {errors}")
            print(f"[MODEL] Trying Claude...")
            # Fallback to Claude
            start_time = time.time()
            response_text, model_used, errors = call_claude_api(messages, system_prompt)
            response_time = time.time() - start_time
            if response_text:
                print(f"[MODEL] ✅ Claude responded in {response_time:.2f}s")
    else:
        # Prefer quality - try Claude first, then Gemini
        print("[MODEL] Trying Claude (quality)...")
        start_time = time.time()
        response_text, model_used, errors = call_claude_api(messages, system_prompt)
        response_time = time.time() - start_time
        
        if response_text:
            print(f"[MODEL] ✅ Claude responded in {response_time:.2f}s")
        elif GEMINI_AVAILABLE:
            print(f"[MODEL] ⚠️  Claude failed, trying Gemini Pro (free tier)...")
            # Fallback to Gemini
            start_time = time.time()
            response_text, model_used, errors = call_gemini_api(messages, system_prompt, prefer_speed=False, model_choice=gemini_model_choice)
            response_time = time.time() - start_time
            if response_text:
                print(f"[MODEL] ✅ Gemini ({model_used}) responded in {response_time:.2f}s")
    
    if response_text is None:
        print("\n" + "=" * 70)
        print("❌ ALL MODELS FAILED - Possible Issues:")
        print("=" * 70)
        print("\n1. API KEY ISSUE:")
        print("   - Your API keys might be invalid or expired")
        print("   - Check Anthropic: https://console.anthropic.com/")
        print("   - Check Gemini: https://aistudio.google.com/")
        print("\n2. MODEL ACCESS:")
        print("   - Your account might not have access to these models")
        print("\nErrors encountered:")
        if errors:
            if isinstance(errors, list):
                for err in errors:
                    print(err)
            else:
                print(f"  - {errors}")
        print("\n" + "=" * 70 + "\n")
        raise Exception(f"All models failed. Check your API keys and account access.")
    
    reply = response_text
    print(f"\nClarte ({model_used}): {reply}\n")
    
    # Save assistant reply to HelixDB if available
    if USE_HELIXDB:
        save_conversation_turn("assistant", reply)
        # Also save as important memory if it contains insights
        if any(word in reply.lower() for word in ["remember", "last time", "before", "previously"]):
            remember(reply, tags=["insight", "conversation"], importance=8)
    
    messages.append({"role": "assistant", "content": reply})