# Simple Browser Test Guide

## ✅ What's Already Done

- ✅ Pip updated to 25.3
- ✅ ElevenLabs API key added to `clarte_backend_api.py`

## 🚀 Quick Test (3 Steps)

### Step 1: Install Dependencies

Open terminal and run:
```bash
python -m pip install flask flask-cors requests anthropic google-generativeai
```

### Step 2: Start Backend

**Option A: Use the batch file (Easiest)**
```bash
start_backend.bat
```

**Option B: Manual command**
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

**Keep this terminal open!**

### Step 3: Open Browser

1. **Find `clarte_web_voice.html`** in your project folder

2. **Open it:**
   - **Right-click** → "Open with" → **Chrome** or **Edge**
   - Or **drag** the file into browser window

3. **Allow microphone** when browser asks

4. **Click "Start Listening"**

5. **Speak:** "What is anxiety?"

6. **Watch:**
   - Your message appears
   - Clarte responds
   - Audio plays automatically! 🔊

## 📋 About the PATH Warning

The warning about `flask.exe` not being on PATH is **harmless**. 

**You can ignore it** - the backend uses Flask internally via Python, so it works fine.

**If you want to fix it (optional):**
- The warning is just informational
- Flask works fine without fixing PATH
- You can use `python -m flask` if needed (but backend doesn't need this)

## ✅ Success Indicators

**Backend Terminal:**
- Shows "Running on http://0.0.0.0:8000"
- No errors

**Browser:**
- Shows "Ready to listen"
- "Start Listening" button works
- Microphone permission granted
- Speech is transcribed
- Response appears
- Audio plays

## 🎯 That's It!

1. Install dependencies: `python -m pip install flask flask-cors requests anthropic google-generativeai`
2. Start backend: `python clarte_backend_api.py` (or use `start_backend.bat`)
3. Open `clarte_web_voice.html` in Chrome/Edge
4. Click "Start Listening" and speak!

Your system is ready to test! 🎉
