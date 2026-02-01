# UI Setup Instructions

## Step-by-Step Setup

### 1. Install Node.js (if not installed)

Download from: https://nodejs.org/ (LTS version recommended)

Verify installation:
```bash
node --version
npm --version
```

### 2. Navigate to Project Directory

```bash
cd "C:\Users\wildk\OneDrive\Important files\Project Source\App Development\Clarte.io"
```

### 3. Install Dependencies

```bash
npm install
```

This will create `node_modules/` and install all required packages.

### 4. Create Environment File

Create `.env` file in the root directory:

```env
VITE_BACKEND_URL=http://localhost:8000
```

### 5. Start Backend (Terminal 1)

```bash
python clarte_backend_api.py
```

Keep this running!

### 6. Start Frontend (Terminal 2)

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 7. Open Browser

Open `http://localhost:5173` in Chrome/Edge/Safari

### 8. Test

1. Click the microphone button
2. Allow microphone access when prompted
3. Speak: "What is anxiety?"
4. Watch the magic happen! 🎉

## File Structure Created

```
Clarte.io/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── ai-voice-input.tsx    ✅ Voice input component
│   │   └── ClarteVoiceApp.tsx        ✅ Main app
│   ├── lib/
│   │   └── utils.ts                  ✅ Utilities
│   ├── App.tsx                       ✅ Root component
│   ├── main.tsx                      ✅ Entry point
│   └── index.css                     ✅ Styles
├── package.json                      ✅ Dependencies
├── tsconfig.json                     ✅ TypeScript config
├── tailwind.config.js                ✅ Tailwind config
├── vite.config.ts                    ✅ Vite config
└── .env                              ⚠️ Create this file
```

## Important Notes

- **Backend must be running** before testing the frontend
- **Use Chrome/Edge/Safari** - Firefox doesn't support Web Speech API
- **Microphone permission** is required
- **CORS is enabled** in the backend for web requests

## Troubleshooting

### "npm: command not found"
- Install Node.js from nodejs.org
- Restart terminal after installation

### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### "Backend connection failed"
- Make sure backend is running (`python clarte_backend_api.py`)
- Check backend URL in `.env` file
- Verify backend shows "Running on http://0.0.0.0:8000"

### Port already in use
- Change port in `vite.config.ts`:
  ```ts
  export default defineConfig({
    server: {
      port: 5174, // Change this
    },
    // ...
  })
  ```
