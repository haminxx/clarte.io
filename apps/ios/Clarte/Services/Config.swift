//
//  Config.swift
//  Clarte
//
//  Set these in Xcode scheme environment or Info.plist.
//  For production, use a secure config (e.g. Firebase Remote Config).
//

import Foundation

enum Config {
    /// LiveKit WebSocket URL (e.g. wss://your-project.livekit.cloud)
    static let liveKitURL: String? = {
        ProcessInfo.processInfo.environment["LIVEKIT_URL"]
            ?? Bundle.main.object(forInfoDictionaryKey: "LIVEKIT_URL") as? String
    }()

    /// Token server base URL (e.g. https://your-app.onrender.com)
    static let voiceAgentURL: String = {
        ProcessInfo.processInfo.environment["VOICE_AGENT_URL"]
            ?? (Bundle.main.object(forInfoDictionaryKey: "VOICE_AGENT_URL") as? String)
            ?? ""
    }()
}
