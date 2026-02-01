# Complete Browser Testing Guide

## ✅ Step 1: Fix Flask PATH Warning

The warning about flask.exe not being on PATH is **not critical** - you can ignore it or fix it.

### Option A: Ignore It (Easiest)
Just use `python -m flask` instead of `flask` directly. The backend uses Flask internally, so this won't affect you.

### Option B: Fix PATH (Optional)
Run the fix script:
```powershell
powershell -ExecutionPolicy Bypass -File fix_flask_path.ps1
```

Or manually add to PATH:
1. Press `Win + R`, type: `sysdm.cpl`
2. Advanced → Environment Variables
3. User variables → Path → Edit
4. New → Add: `C:\Users\wildk\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\LocalCache\local-packages\Python313\Scripts`

## ✅ Step 2: Update Pip

Pip should already be updated. Verify:
```bash
python -m pip --version
```

Should show: `pip 25.3.x` or higher

If not updated:
```bash
python -m pip install --upgrade pip
```

## ✅ Step 3: Add ElevenLabs API Key

**Edit `clarte_backend_api.py` line 29:**

Change:
```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
```

To:
```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "your_elevenlabs_api_key_here")
```

## ✅ Step 4: Install Dependencies

```bash
python -m pip install flask flask-cors requests anthropic google-generativeai
```

## ✅ Step 5: Test ElevenLabs API Key (Optional)

```bash
python test_elevenlabs.py
```

Should show: `✅ SUCCESS! API key is valid`

## ✅ Step 6: Start Backend Server

```bash
python clarte_backend_api.py
```

**Expected output:**
```
======================================================================
Clarte Backend API
======================================================================
Pipeline: Text Input → LLM (Gemini/Claude) → ElevenLabs TTS

Starting server on http://localhost:8000
Web interface: Open clarte_web_voice.html in browser
======================================================================
 * Running on http://0.0.0.0:8000
 * Debug mode: on
```

**Keep this terminal open!** The server must keep running.

## ✅ Step 7: Open Web Interface

### Method 1: Right-Click
1. Find `clarte_web_voice.html` in your project folder
2. Right-click → "Open with" → **Chrome** or **Edge** or **Safari**
3. File opens in browser

### Method 2: Drag & Drop
1. Open Chrome/Edge/Safari
2. Drag `clarte_web_voice.html` into browser window
3. File opens

### Method 3: Double-Click
1. Double-click `clarte_web_voice.html`
2. If it opens in browser, great!
3. If it opens in editor, use Method 1 or 2

## ✅ Step 8: Grant Microphone Permission

When the page loads:
- Browser shows: "Allow microphone access?"
- Click **"Allow"** or **"Allow"** button
- Status should show: "Ready to listen"

## ✅ Step 9: Test the Voice Pipeline

### First Test:
1. **Click "Start Listening"**
   - Button changes to "Stop Listening"
   - Status: "Listening... Speak now!"

2. **Speak clearly:**
   - Say: "What is anxiety?"
   - Wait 2-3 seconds

3. **Watch the magic:**
   - Your message appears: "You: What is anxiety?"
   - Status: "Processing..."
   - Backend processes with LLM
   - Clarte's response appears
   - Audio plays automatically! 🔊

### Continue Testing:
- Click "Start Listening" again
- Ask: "Quick question: what is depression?"
- Or: "Explain deeply how anxiety works"

## 📊 What You Should See

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
│ Microphone → LLM → ElevenLabs TTS  │
│                                     │
│ Status: Ready to listen            │
│                                     │
│ [Start Listening]                  │
│                                     │
│ Conversation:                       │
│ ┌─────────────────────────────┐    │
│ │ You: What is anxiety?        │    │
│ │ Clarte: [Response text]      │    │
│ │ 🔊 [Audio playing]          │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## 🔍 Troubleshooting

### Backend won't start

**Error: "ModuleNotFoundError: No module named 'flask'"**
```bash
python -m pip install flask flask-cors
```

**Error: "Address already in use"**
- Port 8000 is busy
- Change port in `clarte_backend_api.py` line 297:
  ```python
  app.run(host='0.0.0.0', port=8001, debug=True)
  ```
- Update `clarte_web_voice.html` line 95:
  ```javascript
  const BACKEND_URL = 'http://localhost:8001';
  ```

### Browser shows "Failed to fetch"

**Check:**
1. Backend is running (see terminal)
2. Backend URL matches (should be `http://localhost:8000`)
3. No firewall blocking

**Fix:** Open browser console (F12) → Check Network tab for errors

### Microphone not working

**Check:**
- Browser permission granted
- Using Chrome/Edge/Safari (not Firefox)
- Microphone is connected

**Fix:**
- Chrome: Settings → Privacy → Site Settings → Microphone → Allow
- Check Windows microphone settings

### No audio playback

**Check:**
1. ElevenLabs API key is correct
2. Backend terminal shows no errors
3. Browser console (F12) shows no errors

**Test:**
```bash
python test_elevenlabs.py
```

### "ElevenLabs API key not set"

**Fix:** Make sure you added the key to `clarte_backend_api.py` line 29

## ✅ Success Checklist

- [ ] Pip updated to 25.3+
- [ ] Flask PATH warning fixed (or ignored)
- [ ] ElevenLabs API key added to `clarte_backend_api.py` line 29
- [ ] Dependencies installed (`flask`, `flask-cors`, etc.)
- [ ] Backend running (`python clarte_backend_api.py`)
- [ ] Browser opened `clarte_web_voice.html`
- [ ] Microphone permission granted
- [ ] "Start Listening" button clicked
- [ ] Spoke into microphone
- [ ] Received response
- [ ] Audio played automatically

## 🎯 Quick Commands Reference

```bash
# Update pip
python -m pip install --upgrade pip

# Install dependencies
python -m pip install flask flask-cors requests anthropic google-generativeai

# Test API key
python test_elevenlabs.py

# Start backend
python clarte_backend_api.py

# Open HTML file
# Right-click clarte_web_voice.html → Open with → Chrome
```

## 🚀 You're Ready!

1. ✅ Update pip (if needed)
2. ✅ Add ElevenLabs API key
3. ✅ Start backend: `python clarte_backend_api.py`
4. ✅ Open `clarte_web_voice.html` in browser
5. ✅ Click "Start Listening" and speak!

Your voice pipeline is ready to test! 🎉
