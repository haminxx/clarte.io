# Clarte iOS

Swift/SwiftUI iPhone app for Clarte: welcome flow, Firebase auth (Apple / Google / email), glass-style home, and **Vapi.ai** voice (Tier 1, same idea as the web demo’s default).

## Swift Package Manager (Xcode)

Add these packages (**File → Add Package Dependencies**):

| Package | URL | Products to add |
|--------|-----|-------------------|
| Firebase | `https://github.com/firebase/firebase-ios-sdk` | `FirebaseAuth`, `FirebaseCore` |
| Google Sign-In | `https://github.com/google/GoogleSignIn-iOS` | `GoogleSignIn` |
| Vapi | `https://github.com/VapiAI/client-sdk-ios` | `Vapi` (pulls **Daily** SDK) |
| LiveKit (optional Tier 2) | `https://github.com/livekit/client-sdk-swift` | When you implement `LiveKitRoomWrapper` |

Minimum deployment: **iOS 18.0** (for Siri / snippet intents).

## Firebase setup

1. In [Firebase Console](https://console.firebase.google.com), add an **iOS** app with bundle ID `io.clarte.Clarte` (or your bundle ID).
2. Download **GoogleService-Info.plist** and add it to the **Clarte** target. Do not commit secrets if your policy forbids it.
3. Enable **Sign in with Apple** and **Google** in Authentication → Sign-in method.
4. For **Google** on iOS: copy **REVERSED_CLIENT_ID** from `GoogleService-Info.plist` into **URL Types** (Xcode → Target → Info → URL Types) as a URL scheme so Google Sign-In can return to your app.

## Sign in with Apple

- Add capability **Sign In with Apple** in Xcode (Signing & Capabilities). The repo includes `com.apple.developer.applesignin` in `Clarte.entitlements` for the same.

## Vapi (voice)

Set **Run** scheme environment variables (Product → Scheme → Edit Scheme → Run → Arguments → Environment Variables):

| Name | Example |
|------|---------|
| `VAPI_PUBLIC_KEY` | Same as web `NEXT_PUBLIC_VAPI_PUBLIC_KEY` |
| `VAPI_ASSISTANT_ID` | Same as your web demo assistant ID |

You can also add `VAPI_PUBLIC_KEY` / `VAPI_ASSISTANT_ID` to **Info.plist** for local dev (not recommended for production).

Tier 2 (**LiveKit** + token server) remains optional; see `Config.swift`, `TokenService.swift`, and `VoiceCallView.swift`.

## Source files (add to Xcode target)

- `ClarteApp.swift`, `AppRootView.swift`, `ContentView.swift` (preview helper)
- `Views/`: `WelcomeAnimatedView.swift`, `AuthView.swift`, `HomeView.swift`, `MainTabShell.swift`, `VoiceOrbView.swift`, `VoiceCardView.swift`, `VoiceCallView.swift`, `ClarteVoiceSnippetView.swift`
- `Services/`: `Config.swift`, `SessionManager.swift`, `AuthUtilities.swift`, `VapiCallCoordinator.swift`, `MicrophoneLevelMonitor.swift`, `TokenService.swift`, `LiveKitRoomWrapper.swift`, `ClarteAudioSession.swift`
- `Intents/StartClarteIntent.swift`
- `Info.plist`, `Clarte.entitlements`, `GoogleService-Info.plist` (from Firebase)

## Flow

1. **Welcome** — animated blue gradient + film-grain noise; Continue.
2. **Auth** — Apple, Google, or email (Firebase).
3. **Home** — photo background, glass “Now for you” cards, floating glass tab bar, **orb** to start/stop a **Vapi** call.

## Siri / Action Button

Unchanged: see existing `StartClarteIntent` and `ClarteVoiceSnippetView`.
