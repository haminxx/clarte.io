//
//  Config.swift
//  Clarte
//
//  Set via Xcode scheme environment variables or Info.plist.
//

import Foundation

enum Config {
    /// LiveKit WebSocket URL (Tier 2 / optional).
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

    /// Vapi.ai public key (same concept as NEXT_PUBLIC_VAPI_PUBLIC_KEY on web).
    static let vapiPublicKey: String = {
        ProcessInfo.processInfo.environment["VAPI_PUBLIC_KEY"]
            ?? (Bundle.main.object(forInfoDictionaryKey: "VAPI_PUBLIC_KEY") as? String)
            ?? ""
    }()

    /// Assistant ID from Vapi dashboard (NEXT_PUBLIC_VAPI_ASSISTANT_ID_* on web).
    static let vapiAssistantId: String = {
        ProcessInfo.processInfo.environment["VAPI_ASSISTANT_ID"]
            ?? (Bundle.main.object(forInfoDictionaryKey: "VAPI_ASSISTANT_ID") as? String)
            ?? ""
    }()
}
