# Clarte iOS

Swift/SwiftUI iPhone app for Clarte voice AI.

## Setup

1. Open Xcode and create a new **iOS App** project:
   - Product Name: Clarte
   - Team: Your Apple Developer team
   - Organization Identifier: io.clarte
   - Interface: SwiftUI
   - Language: Swift
   - Minimum Deployments: iOS 16.0

2. Add the Swift files from this folder to your Xcode project:
   - `ClarteApp.swift` (replace the default App file)
   - `ContentView.swift`
   - `Views/VoiceCardView.swift`
   - `Views/VoiceCallView.swift`
   - `Services/TokenService.swift`
   - `Services/Config.swift`
   - `Services/LiveKitRoomWrapper.swift`
   - `Intents/StartClarteIntent.swift`

3. Add LiveKit Swift SDK via Swift Package Manager:
   - File > Add Package Dependencies
   - URL: `https://github.com/livekit/client-sdk-swift`
   - Add to your app target

4. Replace `LiveKitRoomWrapper` with actual LiveKit `Room` usage. See [LiveKit Swift docs](https://docs.livekit.io/client-sdk-swift/).

5. Copy `Info.plist` keys into your project's Info tab (or merge with existing Info.plist):
   - NSMicrophoneUsageDescription
   - NSCameraUsageDescription
   - UIBackgroundModes: audio

6. Add environment variables for development:
   - Edit Scheme > Run > Arguments > Environment Variables
   - LIVEKIT_URL = wss://your-project.livekit.cloud
   - VOICE_AGENT_URL = https://your-render-app.onrender.com

7. For Siri: Enable "Siri" capability in Signing & Capabilities. The `Clarte.entitlements` includes the Siri entitlement.

## Siri

After setup, users can say:
- "Hey Siri, start Clarte"
- "Hey Siri, talk to Clarte"

## Background

The app uses `UIBackgroundModes: audio` so voice calls continue when the app is in the background.
