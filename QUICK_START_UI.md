# 🚀 Quick Start - React UI

## Prerequisites Check

- ✅ Node.js installed? Run: `node --version` (should be 18+)
- ✅ Python backend ready? (`clarte_backend_api.py`)

## 3-Step Setup

### Step 1: Install Dependencies

```bash
npm install
```

Wait for installation to complete (~30 seconds).

### Step 2: Create Environment File

Create `.env` file in root directory:

```env
VITE_BACKEND_URL=http://localhost:8000
```

### Step 3: Start Both Servers

**Terminal 1 (Backend):**
```bash
python clarte_backend_api.py
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## Open Browser

Open: `http://localhost:5173`

## Test

1. Click microphone button 🎙️
2. Allow microphone access
3. Speak: "What is anxiety?"
4. Watch it work! 🎉

## What's Included

✅ React + TypeScript + Vite
✅ Tailwind CSS (configured)
✅ shadcn/ui structure (`/components/ui`)
✅ AIVoiceInput component (integrated)
✅ Web Speech API (microphone access)
✅ Backend integration (Claude/Gemini + ElevenLabs)
✅ Beautiful gradient UI

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   └── ai-voice-input.tsx    ← Voice input component
│   └── ClarteVoiceApp.tsx        ← Main app
├── lib/
│   └── utils.ts                  ← Utility functions
├── types/
│   └── speech-recognition.d.ts   ← TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

## Troubleshooting

**"npm: command not found"**
→ Install Node.js from nodejs.org

**"Cannot find module"**
→ Run `npm install` again

**Backend connection failed**
→ Make sure backend is running on port 8000

**Microphone not working**
→ Use Chrome/Edge/Safari (not Firefox)

## Next Steps

- Customize colors in `tailwind.config.js`
- Modify UI in `src/components/ClarteVoiceApp.tsx`
- Add features as needed
