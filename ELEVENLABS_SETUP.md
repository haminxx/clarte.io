# ElevenLabs API Key Setup & Browser Testing Guide

## 🔑 Where to Add Your ElevenLabs API Key

### Option 1: Add Directly in Code (Easiest)

**File 1: `clarte_voice_pipeline.py` (Line 33)**
```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "YOUR_API_KEY_HERE")  # Replace YOUR_API_KEY_HERE
```

**File 2: `clarte_backend_api.py` (Line 29)**
```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "YOUR_API_KEY_HERE")  # Replace YOUR_API_KEY_HERE
```

### Option 2: Use Environment Variable (More Secure)

**Windows PowerShell:**
```powershell
$env:ELEVENLABS_API_KEY="your_api_key_here"
```

**Windows CMD:**
```cmd
set ELEVENLABS_API_KEY=your_api_key_here
```

**Linux/Mac:**
```bash
export ELEVENLABS_API_KEY="your_api_key_here"
```

## 🌐 How to Test in Browser

### Step 1: Install Backend Dependencies

```bash
pip install flask flask-cors requests anthropic google-generativeai
```

### Step 2: Add Your ElevenLabs API Key

Edit `clarte_backend_api.py` line 29:
```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "your_actual_api_key_here")
```

### Step 3: Start the Backend Server

```bash
python clarte_backend_api.py
```

You should see:
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

### Step 4: Open Web Interface

1. **Open `clarte_web_voice.html` in your browser**
   - Right-click the file → "Open with" → Chrome/Edge/Safari
   - Or drag and drop into browser window

2. **Allow Microphone Permission**
   - Browser will ask for microphone access
   - Click "Allow"

3. **Click "Start Listening"**
   - Button will change to "Stop Listening"
   - Status will show "Listening... Speak now!"

4. **Speak into your microphone**
   - Say something like: "What is anxiety?"
   - Wait for processing
   - You'll see the conversation appear
   - Audio will play automatically

### Step 5: Test the Flow

**Example conversation:**
1. Click "Start Listening"
2. Say: "Quick question: what is depression?"
3. See your message appear
4. Wait for Clarte's response
5. Hear ElevenLabs audio play

## 🔧 Troubleshooting

### Problem: "ElevenLabs API key not set"
**Solution:** Make sure you added the API key to `clarte_backend_api.py` line 29

### Problem: Backend won't start
**Solution:** 
- Check if port 8000 is already in use
- Install Flask: `pip install flask flask-cors`
- Check Python version: `python --version` (should be 3.7+)

### Problem: Browser can't connect to backend
**Solution:**
- Make sure backend is running (`python clarte_backend_api.py`)
- Check backend URL in `clarte_web_voice.html` (line ~95)
- Should be: `const BACKEND_URL = 'http://localhost:8000';`

### Problem: Microphone not working
**Solution:**
- Check browser permissions (Settings → Privacy → Microphone)
- Use Chrome, Edge, or Safari (Firefox doesn't support Web Speech API)
- Make sure microphone is connected and working

### Problem: No audio playback
**Solution:**
- Check browser console for errors (F12)
- Make sure ElevenLabs API key is valid
- Check backend logs for errors

## 📋 Quick Test Checklist

- [ ] ElevenLabs API key added to `clarte_backend_api.py`
- [ ] Backend dependencies installed (`flask`, `flask-cors`, etc.)
- [ ] Backend server running (`python clarte_backend_api.py`)
- [ ] Browser opened `clarte_web_voice.html`
- [ ] Microphone permission granted
- [ ] "Start Listening" button clicked
- [ ] Spoke into microphone
- [ ] Received response and heard audio

## 🎯 Expected Flow

```
1. Open clarte_web_voice.html in browser
   ↓
2. Click "Start Listening"
   ↓
3. Browser requests microphone permission → Allow
   ↓
4. Status: "Listening... Speak now!"
   ↓
5. Speak: "What is anxiety?"
   ↓
6. Status: "Processing..."
   ↓
7. Your message appears in conversation
   ↓
8. Backend processes with LLM (Claude/Gemini)
   ↓
9. Backend generates audio with ElevenLabs
   ↓
10. Clarte's response appears
   ↓
11. Audio plays automatically
   ↓
12. Status: "Ready to listen"
```

## 💡 Tips

- **Use Chrome or Edge** for best Web Speech API support
- **Speak clearly** and wait for "Listening" status
- **Check browser console** (F12) for any errors
- **Check backend terminal** for processing logs
- **Test with simple questions first** like "What is anxiety?"

## 🚀 Ready to Test!

1. Add your ElevenLabs API key
2. Start backend: `python clarte_backend_api.py`
3. Open `clarte_web_voice.html` in browser
4. Click "Start Listening" and speak!

Your voice pipeline is ready! 🎉
