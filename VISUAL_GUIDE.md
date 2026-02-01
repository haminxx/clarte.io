# 👀 Visual Guide - What You Should See

## 🖥️ Terminal 1: Backend

**When running correctly, you should see:**

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
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: xxx-xxx-xxx
```

**Key indicators:**
- ✅ "Running on http://0.0.0.0:8000" ← **This means backend is active!**
- ✅ No red error messages
- ✅ Terminal stays open (don't close it!)

---

## 🖥️ Terminal 2: Frontend

**When running correctly, you should see:**

```
  VITE v5.x.x  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose

  ready in 523 ms.
```

**Key indicators:**
- ✅ "ready in xxx ms" ← **This means frontend is active!**
- ✅ Shows URL: `http://localhost:5173/`
- ✅ No red error messages
- ✅ Terminal stays open (don't close it!)

---

## 🌐 Browser: What You Should See

### When Everything Works:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Purple/Pink Gradient Background]                     │
│                                                         │
│              ┌─────────────────────┐                   │
│              │                     │                   │
│              │   🎙️ Clarte Voice   │                   │
│              │                     │                   │
│              │ Microphone → LLM → │                   │
│              │   ElevenLabs TTS   │                   │
│              │                     │                   │
│              │      ┌─────┐        │                   │
│              │      │ 🎙️ │        │                   │
│              │      └─────┘        │                   │
│              │                     │                   │
│              │       00:00        │                   │
│              │                     │                   │
│              │  ▁ ▂ ▃ ▄ ▅ ▆ ▇ █   │  ← Waveform bars  │
│              │                     │                   │
│              │    Click to speak   │                   │
│              │                     │                   │
│              │  Conversation:      │                   │
│              │  (Empty)           │                   │
│              │                     │                   │
│              └─────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Visual Elements:

1. **Background:** Purple → Pink → Red gradient
2. **White Card:** Centered, rounded corners, shadow
3. **Title:** "🎙️ Clarte Voice" (large, bold)
4. **Subtitle:** "Microphone → LLM → ElevenLabs TTS"
5. **Microphone Button:** Circular button with mic icon
6. **Timer:** Shows "00:00" (updates when recording)
7. **Waveform:** 48 bars (animate when recording)
8. **Status Text:** "Click to speak" (changes to "Listening..." when active)
9. **Conversation Area:** Empty initially, fills with messages

---

## ❌ When There's an Error

### Error Box (Red):

```
┌─────────────────────────────────────┐
│  Connection Error                   │
│                                     │
│  Cannot connect to backend at      │
│  http://localhost:8000.             │
│                                     │
│  Make sure the backend server is   │
│  running: python clarte_backend_   │
│  api.py                             │
│                                     │
│  Backend URL: http://localhost:8000│
└─────────────────────────────────────┘
```

**This means:** Backend is not running!

**Fix:** Start backend: `python clarte_backend_api.py`

---

## 🎯 Step-by-Step Visual Check

### 1. Check Terminal 1 (Backend)

**Look for:**
```
✅ "Running on http://0.0.0.0:8000"
```

**If you see this:** ✅ Backend is running!

**If you DON'T see this:** ❌ Start backend!

---

### 2. Check Terminal 2 (Frontend)

**Look for:**
```
✅ "ready in xxx ms"
✅ "Local: http://localhost:5173/"
```

**If you see this:** ✅ Frontend is running!

**If you DON'T see this:** ❌ Start frontend!

---

### 3. Check Browser

**Open:** `http://localhost:5173`

**Look for:**
```
✅ Beautiful gradient background
✅ White card with Clarte UI
✅ Microphone button
✅ No red error boxes
```

**If you see this:** ✅ Everything is working!

**If you see red error box:** ❌ Check backend is running!

---

### 4. Test Microphone

**Click microphone button:**

**Should happen:**
1. ✅ Browser asks: "Allow microphone access?"
2. ✅ Click "Allow"
3. ✅ Button shows spinner
4. ✅ Waveform bars animate
5. ✅ Timer starts counting
6. ✅ Text changes to "Listening..."

**If this happens:** ✅ Everything works perfectly!

**If error appears:** ❌ Check browser console (F12) for errors

---

## 🔍 Quick Status Check

**Run this command:**
```bash
QUICK_STATUS_CHECK.bat
```

**Or check manually:**

**Backend:**
- Open: `http://localhost:8000/health`
- Should see: `{"status":"ok",...}`

**Frontend:**
- Open: `http://localhost:5173`
- Should see: Clarte UI

---

## ✅ Success Checklist

- [ ] Terminal 1 shows "Running on http://0.0.0.0:8000"
- [ ] Terminal 2 shows "ready in xxx ms"
- [ ] Browser shows Clarte UI (no errors)
- [ ] Microphone button is visible
- [ ] Can click microphone and it works
- [ ] No red error boxes

**If all checked:** 🎉 You're ready to use Clarte!
