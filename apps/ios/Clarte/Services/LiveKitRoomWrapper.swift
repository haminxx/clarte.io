//
//  LiveKitRoomWrapper.swift
//  Clarte
//
//  Tier 2 (LiveKit + token server). Add livekit-client-sdk-swift via SPM, then implement connect.
//

import Foundation

enum LiveKitTier2Error: LocalizedError {
    case notImplemented

    var errorDescription: String? {
        switch self {
        case .notImplemented:
            return "LiveKit is not wired in this build. The app uses Vapi (Tier 1) by default. Add the LiveKit Swift SDK and implement Room.connect in LiveKitRoomWrapper."
        }
    }
}

/// Placeholder until LiveKit Swift SDK is fully integrated.
final class LiveKitRoomWrapper {
    func connect(url: String, token: String) async throws {
        throw LiveKitTier2Error.notImplemented
    }

    func disconnect() {}
}
