# Voice Pipeline Setup Guide
## Microphone → LLM → ElevenLabs TTS

## ✅ What Was Changed

### Removed:
- ❌ All Deepgram code
- ❌ `clarte_stt.py` (deleted)
- ❌ `test_stt.py` (deleted)

### Created:
- ✅ `clarte_voice_pipeline.py` - Desktop/Mobile voice pipeline
- ✅ `clarte_web_voice.html` - Web interface with Web Speech API
- ✅ `clarte_backend_api.py` - Backend API for web interface

## 🎯 New Pipeline Architecture

```
┌─────────────────────────────────────────┐
│  Desktop/Mobile                          │
│  Microphone → speech_recognition         │
│  (Google Speech API - FREE)              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend                                 │
│  LLM: Claude or Gemini                  │
│  (Auto-selected based on preference)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  ElevenLabs TTS                          │
│  Generate high-quality audio            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Audio Output                            │
│  Play audio file                         │
└─────────────────────────────────────────┘
```

## 🚀 Usage

### Option 1: Desktop/Mobile (Python)

**Install dependencies:**
```bash
pip install SpeechRecognition pyaudio requests anthropic google-generativeai flask flask-cors
```

**Set ElevenLabs API key:**
```bash
# Windows PowerShell
$env:ELEVENLABS_API_KEY="your_api_key_here"

# Windows CMD
set ELEVENLABS_API_KEY=your_api_key_here

# Linux/Mac
export ELEVENLABS_API_KEY="your_api_key_here"
```

**Or add to code:**
Edit `clarte_voice_pipeline.py` line 25:
```python
ELEVENLABS_API_KEY = "your_api_key_here"
```

**Run:**
```bash
python clarte_voice_pipeline.py
```

### Option 2: Web Interface

**1. Start backend:**
```bash
python clarte_backend_api.py
```

**2. Open web interface:**
- Open `clarte_web_voice.html` in Chrome/Edge/Safari
- Click "Start Listening"
- Speak into your microphone

**3. Update backend URL:**
If backend is not on `localhost:8000`, edit `clarte_web_voice.html`:
```javascript
const BACKEND_URL = 'http://your-backend-url:8000';
```

## 📋 Components

### 1. Speech Recognition (STT)
- **Desktop/Mobile:** `speech_recognition` library (uses Google Speech API - FREE)
- **Web:** Web Speech API (browser built-in - FREE)

### 2. LLM Processing
- **Claude:** Anthropic API
- **Gemini:** Google Gemini API (free tier)
- **Auto-selection:** Based on speed/quality preference

### 3. Text-to-Speech (TTS)
- **ElevenLabs API:** High-quality voice synthesis
- **Voice customization:** Change voice ID in code
- **Audio output:** Saves as MP3 file and plays

## 🔧 Configuration

### ElevenLabs Setup

1. **Get API key:**
   - Sign up at: https://elevenlabs.io/
   - Get API key from dashboard

2. **Choose voice:**
   - Browse voices at: https://elevenlabs.io/voices
   - Copy voice ID
   - Set `ELEVENLABS_VOICE_ID` environment variable or in code

3. **Default voice:** Rachel (ID: `21m00Tcm4TlvDq8ikWAM`)

### API Keys Required

- ✅ **Claude:** Already configured
- ✅ **Gemini:** Already configured
- ✅ **Exa:** Already configured
- ⚠️ **ElevenLabs:** **YOU NEED TO ADD THIS**

## 📝 Example Usage

### Desktop/Mobile:
```
1. Run: python clarte_voice_pipeline.py
2. Speak: "What is anxiety?"
3. System processes with LLM
4. ElevenLabs generates audio
5. Audio plays automatically
```

### Web:
```
1. Start backend: python clarte_backend_api.py
2. Open clarte_web_voice.html in browser
3. Click "Start Listening"
4. Speak into microphone
5. See conversation and hear audio response
```

## 🎯 Features

- ✅ **Free STT:** Uses Google Speech API (no cost)
- ✅ **Smart LLM selection:** Auto-chooses Claude or Gemini
- ✅ **High-quality TTS:** ElevenLabs voice synthesis
- ✅ **Cross-platform:** Works on Desktop, Mobile, Web
- ✅ **No Deepgram:** Completely removed

## ⚠️ Important Notes

1. **ElevenLabs API Key Required:**
   - Get from: https://elevenlabs.io/
   - Set as environment variable or in code

2. **Microphone Permission:**
   - Desktop: May need to grant microphone access
   - Web: Browser will request permission

3. **Browser Support:**
   - Web Speech API works in Chrome, Edge, Safari
   - Not supported in Firefox

4. **Audio Files:**
   - Generated audio saved as MP3 files
   - Files stored in `static/audio/` (web) or current directory (desktop)

## 🚀 Next Steps

1. **Get ElevenLabs API key**
2. **Set environment variable or add to code**
3. **Test desktop version:** `python clarte_voice_pipeline.py`
4. **Test web version:** Start backend + open HTML file

Your new voice pipeline is ready! 🎉
