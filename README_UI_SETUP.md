# Clarte UI Setup Guide

## 🎯 Overview

This is a React + TypeScript + Tailwind CSS + shadcn/ui project for the Clarte voice assistant interface.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Python backend running (`clarte_backend_api.py`)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS
- lucide-react (icons)
- clsx & tailwind-merge (utility functions)

### 2. Configure Backend URL

Create a `.env` file in the root directory:

```env
VITE_BACKEND_URL=http://localhost:8000
```

Or edit `src/components/ClarteVoiceApp.tsx` and change the `BACKEND_URL` constant.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

### 4. Start Backend Server

In a separate terminal, start the Python backend:

```bash
python clarte_backend_api.py
```

The backend should be running on `http://localhost:8000`.

## 🏗️ Project Structure

```
clarte-ui/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── ai-voice-input.tsx    # Voice input component
│   │   └── ClarteVoiceApp.tsx        # Main app component
│   ├── lib/
│   │   └── utils.ts                  # Utility functions (cn)
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles
├── index.html                        # HTML template
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.js                # Tailwind config
├── vite.config.ts                    # Vite config
└── .env                              # Environment variables
```

## 🎨 Component Details

### AIVoiceInput Component

Located at `src/components/ui/ai-voice-input.tsx`

**Features:**
- Web Speech API integration for microphone access
- Visual audio waveform animation
- Timer display
- Click to start/stop recording
- Automatic transcript callback

**Props:**
- `onStart?: () => void` - Called when recording starts
- `onStop?: (duration: number) => void` - Called when recording stops
- `onTranscript?: (text: string) => void` - Called with transcribed text
- `visualizerBars?: number` - Number of bars in waveform (default: 48)
- `demoMode?: boolean` - Enable demo mode (default: false)
- `className?: string` - Additional CSS classes

### ClarteVoiceApp Component

Located at `src/components/ClarteVoiceApp.tsx`

**Features:**
- Integrates AIVoiceInput component
- Connects to backend API
- Displays conversation history
- Handles audio playback
- Error handling

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Browser Compatibility

The Web Speech API is supported in:
- ✅ Chrome/Edge (Chromium)
- ✅ Safari
- ❌ Firefox (not supported)

## 🔌 Backend Integration

The frontend sends POST requests to `/api/chat` with:

```json
{
  "text": "User's transcribed speech"
}
```

Expected response:

```json
{
  "success": true,
  "reply": "Clarte's response text",
  "audio_url": "http://localhost:8000/api/audio/..."
}
```

## 🎯 How It Works

1. **User clicks microphone button** → Web Speech API starts listening
2. **User speaks** → Browser transcribes speech to text
3. **Transcript received** → Sent to backend API (`/api/chat`)
4. **Backend processes** → LLM (Claude/Gemini) generates response
5. **Backend generates audio** → ElevenLabs TTS creates audio file
6. **Response received** → Text displayed + audio played automatically

## 🐛 Troubleshooting

### Microphone not working
- Check browser permissions (Settings → Privacy → Microphone)
- Use Chrome/Edge/Safari (Firefox doesn't support Web Speech API)
- Make sure microphone is connected

### Backend connection error
- Verify backend is running: `python clarte_backend_api.py`
- Check backend URL in `.env` or `ClarteVoiceApp.tsx`
- Check CORS settings in backend (should be enabled)

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version: `node --version` (should be 18+)

## 📝 Notes

- The `/components/ui` folder follows shadcn/ui conventions
- Tailwind CSS is configured with dark mode support
- TypeScript strict mode is enabled
- Path aliases are configured (`@/` → `src/`)

## 🚀 Next Steps

1. Customize the UI design
2. Add more features (settings, history, etc.)
3. Deploy to production
4. Add error boundaries
5. Add loading states
6. Add audio controls
