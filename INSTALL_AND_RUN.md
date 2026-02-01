# 🚀 Install and Run - Step by Step

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Python backend ready (`clarte_backend_api.py`)

## Installation Steps

### 1. Install Node.js (if not installed)

Download from: https://nodejs.org/ (LTS version)

Verify:
```bash
node --version
npm --version
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- lucide-react (icons)
- All other dependencies

**Expected output:**
```
added 234 packages, and audited 235 packages in 45s
```

### 3. Create Environment File

Create `.env` file in root directory:

**Windows (PowerShell):**
```powershell
echo "VITE_BACKEND_URL=http://localhost:8000" > .env
```

**Or manually create `.env` file with:**
```
VITE_BACKEND_URL=http://localhost:8000
```

### 4. Start Backend Server

**Terminal 1:**
```bash
python clarte_backend_api.py
```

**Wait for:**
```
 * Running on http://0.0.0.0:8000
```

**Keep this terminal open!**

### 5. Start Frontend Server

**Terminal 2:**
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 6. Open Browser

Open: **http://localhost:5173**

## Testing

1. **Click the microphone button** 🎙️
2. **Allow microphone access** when browser prompts
3. **Speak:** "What is anxiety?"
4. **Watch:**
   - Your speech is transcribed
   - Sent to backend
   - LLM processes (Claude/Gemini)
   - ElevenLabs generates audio
   - Response appears + audio plays! 🔊

## Troubleshooting

### "npm: command not found"
**Solution:** Install Node.js from nodejs.org

### "Cannot find module '...'"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Backend connection failed"
**Check:**
- Backend is running (`python clarte_backend_api.py`)
- Backend shows "Running on http://0.0.0.0:8000"
- `.env` file has correct URL

### "Microphone not working"
**Check:**
- Using Chrome/Edge/Safari (not Firefox)
- Microphone permission granted
- Microphone is connected

### Port 5173 already in use
**Solution:** Vite will automatically use next available port (5174, 5175, etc.)

## Project Structure

```
Clarte.io/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── ai-voice-input.tsx    ✅ Voice component
│   │   └── ClarteVoiceApp.tsx        ✅ Main app
│   ├── lib/
│   │   └── utils.ts                  ✅ Utilities
│   ├── types/
│   │   └── speech-recognition.d.ts   ✅ TypeScript types
│   ├── App.tsx                       ✅ Root
│   ├── main.tsx                      ✅ Entry
│   └── index.css                     ✅ Styles
├── package.json                      ✅ Dependencies
├── tsconfig.json                     ✅ TypeScript config
├── tailwind.config.js                ✅ Tailwind config
├── vite.config.ts                    ✅ Vite config
└── .env                              ⚠️ Create this
```

## What's Working

✅ React + TypeScript + Vite setup
✅ Tailwind CSS configured
✅ shadcn/ui structure (`/components/ui`)
✅ AIVoiceInput component integrated
✅ Web Speech API (microphone)
✅ Backend API integration
✅ ElevenLabs TTS audio playback
✅ Beautiful gradient UI
✅ Conversation history display

## Next Steps

- Customize UI colors/styles
- Add more features
- Deploy to production

## Quick Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
