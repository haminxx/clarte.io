# ✅ How to Verify Backend & Frontend Are Running

## 🎯 Quick Checklist

- [ ] Backend terminal shows "Running on http://0.0.0.0:8000"
- [ ] Frontend terminal shows "ready in xxx ms" with URL
- [ ] Browser opens and shows the Clarte UI
- [ ] No error messages in browser

## 📋 Step-by-Step Verification

### Step 1: Start Backend

**Terminal 1:**
```bash
python clarte_backend_api.py
```

**✅ Backend is running if you see:**
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

**❌ Backend is NOT running if:**
- Terminal shows errors
- No "Running on http://0.0.0.0:8000" message
- Terminal is empty/closed

**Keep this terminal open!**

### Step 2: Verify Backend Health

**Open browser and go to:**
```
http://localhost:8000/health
```

**✅ Backend is healthy if you see:**
```json
{
  "status": "ok",
  "gemini_available": true,
  "elevenlabs_configured": true
}
```

**❌ Backend has issues if:**
- "This site can't be reached"
- "Connection refused"
- 404 or 500 error

### Step 3: Start Frontend

**Terminal 2:**
```bash
# Add Node.js to PATH (if needed)
$env:Path += ";C:\Program Files\nodejs\"

# Start dev server
npm run dev
```

**✅ Frontend is running if you see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**❌ Frontend is NOT running if:**
- Terminal shows errors
- No "ready in xxx ms" message
- No URL shown

**Keep this terminal open too!**

### Step 4: Open Browser

**Open the URL shown in frontend terminal:**
Usually: `http://localhost:5173`

**✅ Frontend is working if browser shows:**

```
┌─────────────────────────────────────────┐
│                                         │
│         🎙️ Clarte Voice                 │
│   Microphone → LLM → ElevenLabs TTS   │
│                                         │
│    ┌─────────────────────────────┐     │
│    │                             │     │
│    │      [🎙️ Microphone Icon]   │     │
│    │                             │     │
│    │         00:00               │     │
│    │                             │     │
│    │    [Audio Waveform Bars]    │     │
│    │                             │     │
│    │      Click to speak         │     │
│    └─────────────────────────────┘     │
│                                         │
│    Conversation:                       │
│    (Empty - no messages yet)          │
│                                         │
└─────────────────────────────────────────┘
```

**Visual elements you should see:**
- ✅ Purple/pink gradient background
- ✅ White card in center
- ✅ "🎙️ Clarte Voice" title
- ✅ Microphone button (circular)
- ✅ Timer display (00:00)
- ✅ Audio waveform visualization (bars)
- ✅ "Click to speak" text
- ✅ No red error boxes

**❌ Frontend has issues if:**
- Blank white page
- "Cannot GET /" error
- Red error box saying "Connection Error"
- "This site can't be reached"

### Step 5: Check Browser Console

**Press F12** to open browser DevTools

**Go to Console tab**

**✅ Everything is working if:**
- No red error messages
- May see: "Backend URL: http://localhost:8000"
- No "Failed to fetch" errors

**❌ There are issues if:**
- Red errors like:
  - "Failed to fetch"
  - "Cannot connect to backend"
  - "CORS error"
  - "Network error"

### Step 6: Test Connection

**Click the microphone button** 🎙️

**✅ Connection works if:**
1. Browser asks for microphone permission → Click "Allow"
2. Button shows spinner/animation
3. Waveform bars animate
4. Timer starts counting
5. You can speak and it transcribes

**❌ Connection fails if:**
- Red error box appears saying "Cannot connect to backend"
- "Failed to fetch" in console
- Nothing happens when clicking microphone

## 🔍 Troubleshooting

### Backend Not Running?

**Check:**
```bash
# In PowerShell
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
```

**Should show:** Port 8000 is LISTENING

**Fix:**
```bash
python clarte_backend_api.py
```

### Frontend Not Running?

**Check:**
```bash
# In PowerShell
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
```

**Should show:** Port 5173 is LISTENING

**Fix:**
```bash
$env:Path += ";C:\Program Files\nodejs\"
npm run dev
```

### Browser Shows Error?

**Check browser console (F12):**
- Look for red error messages
- Check Network tab for failed requests

**Common fixes:**
- Make sure backend is running
- Check backend URL in `.env` file
- Try refreshing browser (Ctrl + R)

## 📊 Visual Status Indicators

### Terminal Status

**Backend Terminal:**
```
✅ Running = Shows "Running on http://0.0.0.0:8000"
❌ Not Running = Empty or shows errors
```

**Frontend Terminal:**
```
✅ Running = Shows "ready in xxx ms" + URL
❌ Not Running = Empty or shows errors
```

### Browser Status

**✅ Working:**
- Beautiful UI loads
- No error messages
- Microphone button visible
- Can click and interact

**❌ Not Working:**
- Blank page
- Error messages
- "Connection failed" box
- Can't interact with UI

## 🎯 Quick Test Sequence

1. **Start backend** → See "Running on http://0.0.0.0:8000"
2. **Start frontend** → See "ready in xxx ms" + URL
3. **Open browser** → See Clarte UI
4. **Click microphone** → Browser asks for permission
5. **Allow permission** → Can speak and test

## ✅ Success Indicators

**Both are running if:**
- ✅ Two terminals open (backend + frontend)
- ✅ Backend shows "Running on http://0.0.0.0:8000"
- ✅ Frontend shows "ready in xxx ms"
- ✅ Browser shows Clarte UI
- ✅ No error messages
- ✅ Microphone button works

**You're ready to test!** 🎉
