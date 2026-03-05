# Testing Clarte Before Publishing

## Desktop App (Tauri)

### Local development (no install)
```bash
cd apps/desktop
npm install
npm run tauri dev
```
- Opens a window with the Clarte UI
- Uses your `.env` or env vars for `VITE_LIVEKIT_URL` and `VITE_VOICE_AGENT_URL`
- Hot-reloads on code changes

### Build installable prototype (no store)
```bash
cd apps/desktop
npm run tauri build
```
- **macOS:** `apps/desktop/src-tauri/target/release/bundle/macos/Clarte.app`
- **Windows:** `apps/desktop/src-tauri/target/release/bundle/nsis/Clarte_0.1.0_x64-setup.exe`
- Share the `.app` or `.exe` directly; no App Store or Microsoft Store needed

### Prerequisites
- [Rust](https://rustup.rs/)
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) (Xcode on macOS, Visual Studio Build Tools on Windows)

---

## iOS App (Swift/SwiftUI)

### Simulator (no device, no Apple Developer account)
1. Open Xcode
2. Create new iOS App project or open existing one
3. Add Swift files from `apps/ios/Clarte/`
4. Select a simulator (e.g. iPhone 15) from the device dropdown
5. Press **Run** (Cmd+R)
- Runs in the iOS Simulator; no real device or paid account needed

### Physical device (no TestFlight)
1. Connect your iPhone via USB
2. Select your device in Xcode
3. Sign in with your Apple ID in Xcode (Settings > Accounts)
4. Select your team for the Clarte target
5. Press **Run**
- Installs directly on your phone for 7 days (free Apple ID)

### TestFlight (for beta testers)
1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Archive the app (Product > Archive)
3. Distribute to TestFlight
4. Add testers by email; they install via the TestFlight app

---

## Deepgram Setup (TTS)

### 1. Get your API key
- Go to [Deepgram Console](https://console.deepgram.com/) → API Keys
- Create or copy your API key

### 2. Where to set `DEEPGRAM_API_KEY`

| Location | Purpose |
|----------|---------|
| **Local dev** | `voice-agent/.env` |
| **Render** | Environment variables in your Render Web Service dashboard |
| **GitHub** | Not needed for frontend; only Render (backend) needs it |

### 3. Render
1. Open your Render service: https://dashboard.render.com
2. Select your Clarte Web Service
3. Environment → Add variable: `DEEPGRAM_API_KEY` = your key
4. Save; Render will redeploy

### 4. Firebase / GitHub
- Deepgram is backend-only; no Firebase or GitHub secrets needed for it
- Ensure `DEEPGRAM_API_KEY` is set on Render
