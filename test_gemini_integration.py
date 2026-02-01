# Quick test script to verify Gemini API integration
import os
import sys

# Test 1: Check if google-generativeai is installed
print("=" * 70)
print("TEST 1: Checking Gemini SDK installation...")
print("=" * 70)
try:
    import google.generativeai as genai
    print("✅ google-generativeai is installed")
    GEMINI_SDK_AVAILABLE = True
except ImportError:
    print("❌ google-generativeai is NOT installed")
    print("   Installing now...")
    os.system("python -m pip install google-generativeai")
    try:
        import google.generativeai as genai
        print("✅ google-generativeai installed successfully")
        GEMINI_SDK_AVAILABLE = True
    except ImportError:
        print("❌ Failed to install google-generativeai")
        print("   Please run: pip install google-generativeai")
        GEMINI_SDK_AVAILABLE = False
        sys.exit(1)

# Test 2: Check API key
print("\n" + "=" * 70)
print("TEST 2: Checking Gemini API key...")
print("=" * 70)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBeQqsXwifXIWBhfXwItjf1kjt3qyUJOfc")

if GEMINI_API_KEY and len(GEMINI_API_KEY) > 10:
    print(f"✅ API key found: {GEMINI_API_KEY[:20]}...")
else:
    print("❌ API key not found or invalid")
    sys.exit(1)

# Test 3: Configure Gemini
print("\n" + "=" * 70)
print("TEST 3: Configuring Gemini API...")
print("=" * 70)
try:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini API configured successfully")
except Exception as e:
    print(f"❌ Failed to configure Gemini API: {e}")
    sys.exit(1)

# Test 4: Test API call with free tier models
print("\n" + "=" * 70)
print("TEST 4: Testing Gemini API call (free tier models)...")
print("=" * 70)

# Free tier compatible models to test (as of 2024)
free_tier_models = [
    "gemini-2.5-flash-lite",  # Lightest, fastest free tier model
    "gemini-2.5-flash",        # Fast free tier model
    "gemini-2.0-flash",        # Flash 2.0 version
    "gemini-2.5-pro",          # Higher quality free tier model
]

success = False
for model_name in free_tier_models:
    try:
        print(f"\n   Testing {model_name}...")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            "Say 'Hello, Gemini is working!' in one sentence.",
            generation_config={
                "max_output_tokens": 50,
                "temperature": 0.7,
            }
        )
        print(f"   ✅ SUCCESS with {model_name}!")
        print(f"   Response: {response.text.strip()}")
        success = True
        break
    except Exception as e:
        error_msg = str(e)
        if "404" in error_msg or "not found" in error_msg.lower():
            print(f"   ⚠️  Model not available: {model_name}")
        elif "429" in error_msg or "quota" in error_msg.lower():
            print(f"   ⚠️  Quota exceeded (free tier: 5/min, 25/day)")
            print(f"   Wait a few minutes and try again")
        elif "403" in error_msg or "permission" in error_msg.lower():
            print(f"   ⚠️  Permission denied: {model_name}")
        else:
            print(f"   ❌ Failed: {error_msg[:80]}")

if not success:
    print("\n❌ All free tier models failed")
    print("   This might be due to:")
    print("   - Invalid API key")
    print("   - API quota exceeded (free tier: 5 requests/min, 25/day)")
    print("   - Network issues")
    print("   - Account not verified")
    sys.exit(1)

print("\n" + "=" * 70)
print("✅ ALL TESTS PASSED - Gemini integration is working!")
print("=" * 70)
print("\nYou can now run clarte_claude_nlp.py")
print("=" * 70)
