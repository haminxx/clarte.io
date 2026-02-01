# Browser Testing Guide - Step by Step

## 🎯 Quick Start: Test in Browser

### Step 1: Add Your ElevenLabs API Key

**Edit `clarte_backend_api.py`** - Find line 29 and replace the empty string:

```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "YOUR_API_KEY_HERE")
```

Replace `YOUR_API_KEY_HERE` with your actual ElevenLabs API key.

**Also edit `clarte_voice_pipeline.py`** - Find line 33:

```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "YOUR_API_KEY_HERE")
```

### Step 2: Test Your API Key (Optional)

```bash
python test_elevenlabs.py
```

Should show: `✅ SUCCESS! API key is valid`

### Step 3: Install Backend Dependencies

```bash
pip install flask flask-cors requests anthropic google-generativeai
```

### Step 4: Start the Backend Server

Open a terminal and run:

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

**Keep this terminal open!** The server needs to keep running.

### Step 5: Open Web Interface in Browser

1. **Find the file:** `clarte_web_voice.html` in your project folder

2. **Open in browser:**
   - **Option A:** Right-click → "Open with" → Chrome/Edge/Safari
   - **Option B:** Drag and drop the file into browser window
   - **Option C:** Double-click (if HTML files open in browser by default)

3. **Use Chrome, Edge, or Safari** (Firefox doesn't support Web Speech API)

### Step 6: Grant Microphone Permission

When you open the page:
- Browser will ask: "Allow microphone access?"
- Click **"Allow"** or **"Allow"** button

### Step 7: Test the Voice Pipeline

1. **Click "Start Listening"** button
   - Button changes to "Stop Listening"
   - Status shows: "Listening... Speak now!"

2. **Speak into your microphone:**
   - Say: "What is anxiety?"
   - Or: "Quick question: what is depression?"
   - Wait a moment for processing

3. **Watch the conversation:**
   - Your message appears in the conversation area
   - Status changes to "Processing..."
   - Clarte's response appears
   - Audio plays automatically

4. **Continue conversation:**
   - Click "Start Listening" again
   - Ask another question
   - Repeat as needed

### Step 8: Stop

- Click "Stop Listening" to pause
- Close browser tab
- Press `Ctrl+C` in backend terminal to stop server

## 📋 Complete Test Flow

```
Terminal 1:
┌─────────────────────────────────────┐
│ python clarte_backend_api.py        │
│ * Running on http://0.0.0.0:8000    │
│ (Keep this running)                 │
└─────────────────────────────────────┘

Browser:
┌─────────────────────────────────────┐
│ 1. Open clarte_web_voice.html        │
│ 2. Allow microphone                  │
│ 3. Click "Start Listening"           │
│ 4. Speak: "What is anxiety?"         │
│ 5. See response + hear audio          │
└─────────────────────────────────────┘
```

## 🔍 Troubleshooting

### Backend won't start

**Error: "ModuleNotFoundError: No module named 'flask'"**
```bash
pip install flask flask-cors
```

**Error: "Address already in use"**
- Port 8000 is already taken
- Change port in `clarte_backend_api.py` line 297:
  ```python
  app.run(host='0.0.0.0', port=8001, debug=True)  # Changed to 8001
  ```
- Update `clarte_web_voice.html` line 95:
  ```javascript
  const BACKEND_URL = 'http://localhost:8001';  // Match the port
  ```

### Browser can't connect

**Check:**
1. Backend is running (see terminal output)
2. Backend URL matches in HTML file (line 95)
3. No firewall blocking port 8000

**Fix:** Open browser console (F12) and check for errors

### Microphone not working

**Check:**
1. Browser permission granted (check browser settings)
2. Using Chrome/Edge/Safari (not Firefox)
3. Microphone is connected and working

**Fix:** 
- Chrome: Settings → Privacy → Site Settings → Microphone
- Allow microphone access for local files

### No audio playback

**Check:**
1. ElevenLabs API key is correct
2. Backend terminal shows no errors
3. Browser console (F12) shows no errors

**Test API key:**
```bash
python test_elevenlabs.py
```

### "ElevenLabs API key not set" error

**Fix:** Make sure you added the key to `clarte_backend_api.py` line 29:
```python
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "your_actual_key_here")
```

## ✅ Success Indicators

When everything works:
- ✅ Backend shows: "Running on http://0.0.0.0:8000"
- ✅ Browser shows: "Ready to listen"
- ✅ Microphone permission granted
- ✅ "Start Listening" button works
- ✅ Speech is transcribed
- ✅ Response appears in conversation
- ✅ Audio plays automatically

## 🎯 Test Questions to Try

1. **Simple:** "What is anxiety?"
2. **Speed test:** "Quick question: what is depression?"
3. **Quality test:** "Explain deeply how anxiety affects the brain"
4. **Exit:** "Bye" or "Goodbye"

## 📝 Quick Reference

**Files to edit:**
- `clarte_backend_api.py` line 29 - Add ElevenLabs API key
- `clarte_voice_pipeline.py` line 33 - Add ElevenLabs API key (for desktop version)

**Commands:**
```bash
# Test API key
python test_elevenlabs.py

# Start backend
python clarte_backend_api.py

# Open HTML file in browser
# (Right-click → Open with → Browser)
```

**Browser:**
- Open: `clarte_web_voice.html`
- Use: Chrome, Edge, or Safari
- Allow: Microphone permission

## 🚀 You're Ready!

1. ✅ Add ElevenLabs API key to both files
2. ✅ Start backend: `python clarte_backend_api.py`
3. ✅ Open `clarte_web_voice.html` in browser
4. ✅ Click "Start Listening" and speak!

Your voice pipeline is ready to test! 🎉
