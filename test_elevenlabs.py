# test_elevenlabs.py
# Quick test script to verify ElevenLabs API key works

import os
import requests

print("=" * 70)
print("ElevenLabs API Key Test")
print("=" * 70)

# Get API key
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
if not ELEVENLABS_API_KEY:
    print("\n⚠️  ELEVENLABS_API_KEY not set!")
    print("   Set it as environment variable or add to code")
    print("   Example: ELEVENLABS_API_KEY = 'your_key_here'")
    exit(1)

print(f"\n✅ API Key found: {ELEVENLABS_API_KEY[:20]}...{ELEVENLABS_API_KEY[-10:]}")

# Test API call
print("\n[TEST] Testing ElevenLabs API...")
print("=" * 70)

url = f"https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM"  # Default voice (Rachel)

headers = {
    "Accept": "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": ELEVENLABS_API_KEY
}

data = {
    "text": "Hello! This is a test of the ElevenLabs text to speech API.",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.75
    }
}

try:
    print("Sending request to ElevenLabs...")
    response = requests.post(url, json=data, headers=headers, timeout=30)
    
    if response.status_code == 200:
        print("✅ SUCCESS! API key is valid")
        print(f"   Received {len(response.content)} bytes of audio")
        
        # Save test audio
        with open("test_elevenlabs_output.mp3", "wb") as f:
            f.write(response.content)
        print("   ✅ Audio saved to: test_elevenlabs_output.mp3")
        print("\n💡 Play the file to hear the test audio")
        
    elif response.status_code == 401:
        print("❌ FAILED: Invalid API key")
        print("   Check your API key at: https://elevenlabs.io/")
        
    elif response.status_code == 429:
        print("⚠️  Rate limit exceeded")
        print("   You've hit the API rate limit. Wait a moment and try again.")
        
    else:
        print(f"❌ FAILED: HTTP {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
except Exception as e:
    print(f"❌ ERROR: {e}")
    print("   Check your internet connection")

print("\n" + "=" * 70)
