# Quick Start: Add ElevenLabs API Key & Test in Browser

## 🔑 Step 1: Add Your ElevenLabs API Key

### Location 1: Backend API (for browser testing)

**File:** `clarte_backend_api.py`  
**Line:** 29

**Current code:**
```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
```

**Change to:**
```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "YOUR_ELEVENLABS_API_KEY_HERE")
```

Replace `YOUR_ELEVENLABS_API_KEY_HERE` with your actual key.

### Location 2: Desktop Pipeline (optional, for desktop version)

**File:** `clarte_voice_pipeline.py`  
**Line:** 33

**Current code:**
```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")  # Set your ElevenLabs API key
```

**Change to:**
```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "YOUR_ELEVENLABS_API_KEY_HERE")  # Set your ElevenLabs API key
```

## 🌐 Step 2: Test in Browser

### Quick Test (3 Steps):

**1. Start Backend:**
```bash
python clarte_backend_api.py
```

**2. Open HTML File:**
- Find `clarte_web_voice.html` in your project folder
- Right-click → "Open with" → Chrome/Edge/Safari
- Or drag file into browser window

**3. Use It:**
- Click "Start Listening"
- Allow microphone permission
- Speak: "What is anxiety?"
- Wait for response and audio

## ✅ Verification

**Backend should show:**
```
======================================================================
Clarte Backend API
======================================================================
Pipeline: Text Input → LLM (Gemini/Claude) → ElevenLabs TTS

Starting server on http://localhost:8000
Web interface: Open clarte_web_voice.html in browser
======================================================================
 * Running on http://0.0.0.0:8000
```

**Browser should show:**
- "Ready to listen" status
- "Start Listening" button
- After clicking: "Listening... Speak now!"

## 🎯 That's It!

1. Add API key to `clarte_backend_api.py` line 29
2. Run: `python clarte_backend_api.py`
3. Open `clarte_web_voice.html` in browser
4. Click "Start Listening" and speak!

For detailed troubleshooting, see `BROWSER_TEST_GUIDE.md`
