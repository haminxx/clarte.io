# clarte_voice_pipeline.py
# New Pipeline: Microphone → LLM (Gemini/Claude) → ElevenLabs TTS
# Works on Desktop/Mobile/Web

import os
import sys
import time
import requests
import json

# Try to import platform-specific modules
try:
    import speech_recognition as sr
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False
    print("[WARN] speech_recognition not installed. Install with: pip install SpeechRecognition")

# Import LLM clients
import anthropic
try:
    import google.generativeai as genai
    GEMINI_SDK_AVAILABLE = True
except ImportError:
    GEMINI_SDK_AVAILABLE = False

# ==================== CONFIGURATION (set via env; do not commit secrets) ====================
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
EXA_API_KEY = os.getenv("EXA_API_KEY", "")

# ElevenLabs Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")  # Set your ElevenLabs API key
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default voice (Rachel)

# Initialize clients
claude_client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

if GEMINI_SDK_AVAILABLE and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
    except:
        GEMINI_AVAILABLE = False
else:
    GEMINI_AVAILABLE = False

# Free tier Gemini models
FREE_TIER_GEMINI_MODELS = {
    "flash_lite": "gemini-2.5-flash-lite",
    "flash": "gemini-2.5-flash",
    "flash_2": "gemini-2.0-flash",
    "pro": "gemini-2.5-pro",
}

# ==================== SPEECH RECOGNITION (STT) ====================
def get_speech_input():
    """
    Capture speech from microphone and convert to text.
    Works on Desktop/Mobile using speech_recognition library.
    """
    if not SPEECH_RECOGNITION_AVAILABLE:
        print("[ERROR] speech_recognition not available")
        print("Install with: pip install SpeechRecognition")
        return None
    
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()
    
    print("\n[STT] Listening... Speak now!")
    
    try:
        with microphone as source:
            # Adjust for ambient noise
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            
            # Listen for audio
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
        
        print("[STT] Processing speech...")
        
        # Try Google Speech Recognition (free, works offline with internet)
        try:
            text = recognizer.recognize_google(audio)
            print(f"[STT] ✅ You said: {text}")
            return text
        except sr.UnknownValueError:
            print("[STT] ⚠️  Could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"[STT] ⚠️  Error with speech recognition service: {e}")
            return None
            
    except sr.WaitTimeoutError:
        print("[STT] ⚠️  No speech detected (timeout)")
        return None
    except Exception as e:
        print(f"[STT] ⚠️  Error: {e}")
        return None

# ==================== LLM PROCESSING ====================
def decide_model_preference(user_input, research_context=None):
    """Decide whether to prioritize speed or quality"""
    speed_keywords = ['quick', 'fast', 'quickly', 'asap', 'urgent', 'simple', 'brief', 'short', 'just']
    quality_keywords = ['explain', 'detailed', 'comprehensive', 'deep', 'thorough', 'analyze', 
                       'complex', 'important', 'critical', 'understand', 'help me understand',
                       'elaborate', 'expand', 'more about', 'tell me more']
    
    user_lower = user_input.lower()
    
    if any(keyword in user_lower for keyword in speed_keywords):
        return 'speed'
    if any(keyword in user_lower for keyword in quality_keywords):
        return 'quality'
    if research_context and len(research_context) > 200:
        return 'quality'
    if len(user_input) < 50 and '?' in user_input:
        return 'speed'
    
    return 'quality'

def get_gemini_model_choice(user_input):
    """Determine which Gemini model to use"""
    user_lower = user_input.lower()
    if 'flash' in user_lower and 'lite' in user_lower:
        return 'flash_lite'
    elif 'flash' in user_lower and '2.0' in user_lower:
        return 'flash_2'
    elif 'flash' in user_lower:
        return 'flash'
    elif 'pro' in user_lower:
        return 'pro'
    return None

def call_gemini_api(messages, system_prompt, prefer_speed=True, model_choice=None):
    """Call Gemini API using free tier compatible models"""
    if not GEMINI_AVAILABLE:
        return None, None, "Gemini not available"
    
    try:
        if model_choice and model_choice in FREE_TIER_GEMINI_MODELS:
            model_name = FREE_TIER_GEMINI_MODELS[model_choice]
        elif prefer_speed:
            model_name = FREE_TIER_GEMINI_MODELS["flash_lite"]
        else:
            model_name = FREE_TIER_GEMINI_MODELS["pro"]
        
        prompt_parts = [system_prompt + "\n\n"]
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

def call_claude_api(messages, system_prompt):
    """Call Claude API with fallback through multiple models"""
    model_names = [
        "claude-3-haiku-20240307",
        "claude-3-sonnet-20240229",
        "claude-3-opus-20240229",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-sonnet",
    ]
    
    errors = []
    for model_name in model_names:
        try:
            response = claude_client.messages.create(
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

def process_with_llm(user_text, messages, system_prompt, research_context=None):
    """Process user input with LLM (Gemini or Claude)"""
    preference = decide_model_preference(user_text, research_context)
    gemini_model_choice = get_gemini_model_choice(user_text)
    
    print(f"[LLM] Preference: {preference}")
    
    response_text = None
    model_used = None
    errors = None
    
    if preference == 'speed' and GEMINI_AVAILABLE:
        print("[LLM] Trying Gemini Flash Lite (fast)...")
        start_time = time.time()
        response_text, model_used, errors = call_gemini_api(messages, system_prompt, prefer_speed=True, model_choice=gemini_model_choice)
        response_time = time.time() - start_time
        
        if response_text:
            print(f"[LLM] ✅ Gemini ({model_used}) responded in {response_time:.2f}s")
        else:
            print(f"[LLM] ⚠️  Gemini failed, trying Claude...")
            start_time = time.time()
            response_text, model_used, errors = call_claude_api(messages, system_prompt)
            response_time = time.time() - start_time
            if response_text:
                print(f"[LLM] ✅ Claude responded in {response_time:.2f}s")
    else:
        print("[LLM] Trying Claude (quality)...")
        start_time = time.time()
        response_text, model_used, errors = call_claude_api(messages, system_prompt)
        response_time = time.time() - start_time
        
        if response_text:
            print(f"[LLM] ✅ Claude responded in {response_time:.2f}s")
        elif GEMINI_AVAILABLE:
            print(f"[LLM] ⚠️  Claude failed, trying Gemini...")
            start_time = time.time()
            response_text, model_used, errors = call_gemini_api(messages, system_prompt, prefer_speed=False, model_choice=gemini_model_choice)
            response_time = time.time() - start_time
            if response_text:
                print(f"[LLM] ✅ Gemini ({model_used}) responded in {response_time:.2f}s")
    
    if response_text is None:
        print(f"[LLM] ❌ All models failed: {errors}")
        return None
    
    return response_text

# ==================== ELEVENLABS TTS ====================
def text_to_speech_elevenlabs(text, voice_id=None, save_path="clarte_response.mp3"):
    """
    Convert text to speech using ElevenLabs API.
    
    Args:
        text: Text to convert to speech
        voice_id: ElevenLabs voice ID (default: Rachel)
        save_path: Path to save audio file
    
    Returns:
        Path to saved audio file, or None if failed
    """
    if not ELEVENLABS_API_KEY:
        print("[TTS] ⚠️  ElevenLabs API key not set")
        print("      Set ELEVENLABS_API_KEY environment variable or add it to the code")
        return None
    
    if not voice_id:
        voice_id = ELEVENLABS_VOICE_ID
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.0,
            "use_speaker_boost": True
        }
    }
    
    try:
        print(f"[TTS] Generating audio with ElevenLabs...")
        start_time = time.time()
        
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            # Save audio file
            with open(save_path, "wb") as f:
                f.write(response.content)
            
            generation_time = time.time() - start_time
            print(f"[TTS] ✅ Audio generated in {generation_time:.2f}s")
            print(f"[TTS] Saved to: {save_path}")
            
            # Play audio (platform-specific)
            play_audio_file(save_path)
            
            return save_path
        else:
            print(f"[TTS] ❌ ElevenLabs API error: {response.status_code}")
            print(f"      Response: {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"[TTS] ❌ Error generating audio: {e}")
        return None

def play_audio_file(file_path):
    """Play audio file (platform-specific)"""
    import platform
    system = platform.system()
    
    try:
        if system == "Windows":
            import winsound
            winsound.PlaySound(file_path, winsound.SND_FILENAME)
        elif system == "Darwin":  # macOS
            os.system(f'afplay "{file_path}"')
        else:  # Linux
            os.system(f'aplay "{file_path}" 2>/dev/null || paplay "{file_path}"')
        print(f"[TTS] ✅ Audio playback completed")
    except Exception as e:
        print(f"[TTS] ⚠️  Could not play audio automatically: {e}")
        print(f"      Audio file saved at: {file_path}")
        print(f"      Please play it manually")

# ==================== RESEARCH (EXA) ====================
def detect_research_needs(user_input):
    """Detect if user input needs research"""
    question_words = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'should', 'is', 'are', 'do', 'does']
    has_question = any(user_input.lower().startswith(word) for word in question_words) or '?' in user_input
    
    research_keywords = ['depression', 'anxiety', 'stress', 'career', 'relationship', 'health', 'therapy', 
                        'medication', 'treatment', 'cure', 'solution', 'help', 'advice', 'how to', 
                        'what is', 'why do', 'causes', 'symptoms', 'effects', 'major', 'university',
                        'college', 'degree', 'job', 'opportunity', 'salary']
    has_keywords = any(keyword in user_input.lower() for keyword in research_keywords)
    
    return has_question or has_keywords

def get_research_context(user_input):
    """Get research context from Exa"""
    if not EXA_API_KEY:
        return None
    
    try:
        # Try /answer endpoint first
        url = "https://api.exa.ai/answer"
        headers = {
            "x-api-key": EXA_API_KEY,
            "Content-Type": "application/json"
        }
        data = {
            "query": user_input,
            "num_sources": 3,
            "text": {"max_characters": 300}
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=15)
        if response.status_code == 200:
            result = response.json()
            answer = result.get('answer', '')
            if answer:
                return answer[:300]
    except:
        pass
    
    return None

# ==================== MAIN PIPELINE ====================
def main():
    """Main voice pipeline: Microphone → LLM → ElevenLabs TTS"""
    
    print("\n" + "=" * 70)
    print("CLARTE - Voice Pipeline")
    print("=" * 70)
    print("Pipeline: Microphone → LLM (Gemini/Claude) → ElevenLabs TTS")
    print("\nComponents:")
    print("  • STT: speech_recognition (Google Speech API)")
    print("  • LLM: Claude or Gemini (auto-selected)")
    print("  • TTS: ElevenLabs API")
    
    if not ELEVENLABS_API_KEY:
        print("\n⚠️  WARNING: ElevenLabs API key not set!")
        print("   Set ELEVENLABS_API_KEY environment variable")
        print("   Or add it to the code at line 25")
        print("   Get your key at: https://elevenlabs.io/")
    
    if not SPEECH_RECOGNITION_AVAILABLE:
        print("\n⚠️  WARNING: speech_recognition not installed!")
        print("   Install with: pip install SpeechRecognition")
        return
    
    print("\n" + "=" * 70)
    print("Ready! Press Ctrl+C to stop")
    print("=" * 70 + "\n")
    
    # System prompt
    system_prompt = """You are Clarte — a warm but ruthless mirror who combines research with deep Socratic questioning.

When user asks a QUESTION:
1. PRESENT RESEARCH RESULT FIRST: Share the research finding directly, concisely, without fluff.
2. ASK ABOUT UNDERLYING CURIOSITY: Ask what caused their curiosity about this question.

When user shares a STRUGGLE/EMOTION:
1. EMPATHY FIRST: Acknowledge their struggle, worry, or pain.
2. RESEARCH CONTEXT (if available): Share brief research examples as context.
3. SOCRATIC QUESTION: Ask one piercing question that helps them discover their own truth.

CRITICAL RULES:
- Keep responses concise - 3-4 sentences maximum
- Use the user's exact words when possible
- Be gently provocative but compassionate
- Stack every new question on everything said before"""
    
    messages = [{"role": "assistant", "content": "I'm here. What's moving inside you right now?"}]
    
    try:
        while True:
            # Step 1: Get speech input
            user_text = get_speech_input()
            
            if not user_text:
                print("[INFO] No speech detected, trying again...\n")
                continue
            
            if user_text.lower() in ["bye", "exit", "quit", "stop", "goodbye"]:
                reply = "Until the next layer…"
                print(f"\nClarte: {reply}\n")
                text_to_speech_elevenlabs(reply)
                break
            
            # Step 2: Get research context (if needed)
            research_context = None
            if detect_research_needs(user_text):
                print("[RESEARCH] Checking for research context...")
                research_context = get_research_context(user_text)
                if research_context:
                    print(f"[RESEARCH] Found context: {research_context[:100]}...\n")
            
            # Step 3: Add user message
            messages.append({"role": "user", "content": user_text})
            
            # Step 4: Add research context if available
            if research_context:
                is_question = detect_research_needs(user_text) and ('?' in user_text or 
                            any(word in user_text.lower() for word in ['what', 'how', 'why', 'when', 'where', 'who', 'which']))
                
                if is_question:
                    messages.append({
                        "role": "user", 
                        "content": f"[RESEARCH RESULT - Present this first, then ask about their underlying curiosity]: {research_context}"
                    })
                else:
                    messages.append({
                        "role": "user", 
                        "content": f"[Research context: {research_context}]"
                    })
            
            # Step 5: Process with LLM
            print("\n[PROCESSING] Thinking...")
            reply = process_with_llm(user_text, messages, system_prompt, research_context)
            
            if not reply:
                print("[ERROR] Failed to get response from LLM")
                continue
            
            print(f"\nClarte: {reply}\n")
            
            # Step 6: Generate and play audio with ElevenLabs
            text_to_speech_elevenlabs(reply)
            
            # Step 7: Add to conversation history
            messages.append({"role": "assistant", "content": reply})
            
            print("\n" + "-" * 70 + "\n")
            
    except KeyboardInterrupt:
        print("\n\n[OK] Stopped by user")
    except Exception as e:
        print(f"\n[ERROR] Fatal error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
