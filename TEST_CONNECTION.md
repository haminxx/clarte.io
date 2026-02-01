# 🧪 Test Connection - Step by Step

## Quick Test

### 1. Start Backend (Terminal 1)

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
```

**Keep this terminal open!**

### 2. Start Frontend (Terminal 2)

```bash
# Add Node.js to PATH
$env:Path += ";C:\Program Files\nodejs\"

# Start dev server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 3. Open Browser

Open: `http://localhost:5173`

### 4. Check for Errors

**If backend is running:**
- ✅ No error message shown
- ✅ Microphone button visible
- ✅ Can click and use

**If backend is NOT running:**
- ❌ Red error box appears:
  ```
  Connection Error
  Cannot connect to backend at http://localhost:8000.
  Make sure the backend server is running: python clarte_backend_api.py
  Backend URL: http://localhost:8000
  ```

### 5. Test Microphone

1. **Click microphone button** 🎙️
2. **Allow microphone** when browser asks
3. **Speak:** "What is anxiety?"
4. **Watch:**
   - Your speech transcribed
   - Sent to backend
   - Response appears
   - Audio plays automatically! 🔊

## 🔍 Debugging

### Check Backend Health

Open browser and go to:
```
http://localhost:8000/health
```

Should return:
```json
{
  "status": "ok",
  "gemini_available": true,
  "elevenlabs_configured": true
}
```

### Check Browser Console

1. Open browser (F12)
2. Go to **Console** tab
3. Look for:
   - ✅ "Backend URL: http://localhost:8000"
   - ✅ Network requests to `/api/chat`
   - ❌ Any red error messages

### Check Network Tab

1. Open browser (F12)
2. Go to **Network** tab
3. Click microphone and speak
4. Look for:
   - ✅ Request to `http://localhost:8000/api/chat` (Status: 200)
   - ✅ Request to `http://localhost:8000/static/audio/...` (Status: 200)
   - ❌ Failed requests (Status: Failed or 404/500)

## ✅ Success Indicators

- ✅ Backend shows "Running on http://0.0.0.0:8000"
- ✅ Frontend shows "ready in xxx ms"
- ✅ Browser opens without errors
- ✅ No red error box in UI
- ✅ Microphone button works
- ✅ Speech is transcribed
- ✅ Response appears
- ✅ Audio plays

## ❌ Common Issues

### "Cannot connect to backend"

**Cause:** Backend not running

**Fix:**
```bash
python clarte_backend_api.py
```

### "CORS error" or "Failed to fetch"

**Cause:** Backend CORS not enabled or wrong URL

**Fix:** Check `clarte_backend_api.py` has:
```python
CORS(app)  # Line 23
```

### "Audio not playing"

**Cause:** Audio URL issue (now fixed!)

**Fix:** Already fixed - audio URLs now convert to full backend URLs

### "Microphone not working"

**Cause:** Browser permission or wrong browser

**Fix:**
- Use Chrome/Edge/Safari (not Firefox)
- Allow microphone permission
- Check microphone is connected

## 📝 Summary

**Fixed Issues:**
- ✅ Audio URL conversion (relative → absolute)
- ✅ Backend health check
- ✅ Better error messages
- ✅ Connection debugging

**Your UI Component:** Unchanged - works exactly as you provided!

**Next:** Test the connection and let me know if it works!
