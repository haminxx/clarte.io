# Clarte Desktop

Tauri 2 + React + LiveKit voice app.

## Setup

1. Install [Rust](https://rustup.rs/) and [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).
2. Create `apps/desktop/.env` with:
   ```
   VITE_LIVEKIT_URL=wss://your-livekit.cloud
   VITE_VOICE_AGENT_URL=https://your-render-url.onrender.com
   ```
3. `npm install`
4. `npm run tauri dev` (development)
5. `npm run tauri build` (production)

## Background / System Tray

To add minimize-to-tray: add `tauri-plugin-tray` and configure in `src-tauri/tauri.conf.json`.
