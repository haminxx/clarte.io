# 🚀 Test Your System in Browser NOW!

## ✅ Status Check

- ✅ Pip updated to 25.3
- ✅ ElevenLabs API key added (I can see it in your code!)
- ✅ Dependencies installed

## 🎯 3 Simple Steps to Test

### Step 1: Start Backend Server

**Double-click:** `start_backend.bat`

**OR run in terminal:**
```bash
python clarte_backend_api.py
```

**You should see:**
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

**✅ Keep this terminal/window open!**

### Step 2: Open Web Interface

1. **Find:** `clarte_web_voice.html` in your project folder

2. **Open it:**
   - **Right-click** → "Open with" → **Chrome** (recommended)
   - Or drag file into Chrome/Edge window

3. **Browser will ask:** "Allow microphone access?"
   - Click **"Allow"**

### Step 3: Test It!

1. **Click:** "Start Listening" button
   - Status changes to: "Listening... Speak now!"

2. **Speak clearly:**
   - Say: **"What is anxiety?"**
   - Wait 2-3 seconds

3. **Watch:**
   - Your message appears: "You: What is anxiety?"
   - Status: "Processing..."
   - Clarte's response appears
   - **Audio plays automatically!** 🔊

4. **Try again:**
   - Click "Start Listening" again
   - Ask: "Quick question: what is depression?"

## 📊 What You'll See

### Terminal (Backend):
```
[INFO] Received request: What is anxiety?
[LLM] Trying Claude (quality)...
[LLM] ✅ Claude responded in 2.34s
[TTS] Generating audio with ElevenLabs...
[TTS] ✅ Audio generated in 1.23s
```

### Browser:
```
┌─────────────────────────────────────┐
│ 🎙️ Clarte Voice                     │
│                                     │
│ Status: Listening... Speak now!     │
│                                     │
│ [Stop Listening]                    │
│                                     │
│ Conversation:                       │
│ ┌─────────────────────────────┐    │
│ │ You: What is anxiety?        │    │
│ │ Clarte: [Response]          │    │
│ │ 🔊 [Audio playing]          │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## ⚠️ About PATH Warning

The warning about `flask.exe` not being on PATH is **harmless** - you can ignore it!

- Flask works fine without fixing PATH
- Backend uses Flask internally via Python
- No action needed

## 🔍 Troubleshooting

### Backend won't start?
```bash
python -m pip install flask flask-cors
```

### Browser can't connect?
- Make sure backend is running (see terminal)
- Check backend shows "Running on http://0.0.0.0:8000"
- Refresh browser page

### No audio?
- Check backend terminal for errors
- Verify ElevenLabs API key is correct
- Test API key: `python test_elevenlabs.py`

### Microphone not working?
- Use Chrome/Edge (not Firefox)
- Check browser microphone permission
- Make sure microphone is connected

## ✅ Quick Checklist

- [ ] Backend running (`python clarte_backend_api.py`)
- [ ] Browser opened `clarte_web_voice.html`
- [ ] Microphone permission granted
- [ ] Clicked "Start Listening"
- [ ] Spoke into microphone
- [ ] Received response + heard audio

## 🎯 Ready!

1. **Start backend:** `python clarte_backend_api.py`
2. **Open:** `clarte_web_voice.html` in Chrome
3. **Click:** "Start Listening"
4. **Speak:** "What is anxiety?"
5. **Enjoy:** Your voice pipeline! 🎉
