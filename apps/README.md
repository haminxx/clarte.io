# Clarte Native Apps

## Testing before publishing

See [TESTING.md](../../TESTING.md) in the project root for:
- Desktop: `npm run tauri dev` (local) or `npm run tauri build` (installable .app/.exe)
- iOS: Xcode Simulator (no device) or direct install to iPhone (no TestFlight)

## Desktop (Tauri + React)

See [desktop/README.md](desktop/README.md).

- Voice-only call with Marin/Cedar voice selection
- Minimize to system tray
- Build: `cd apps/desktop && npm run tauri build`

## iOS (Swift/SwiftUI)

See [ios/README.md](ios/README.md).

- Native voice call via LiveKit Swift SDK
- Siri: "Hey Siri, start Clarte"
- Background audio for calls
- Create Xcode project and add Swift files from `ios/Clarte/`
