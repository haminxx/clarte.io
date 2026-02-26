//
//  LiveKitRoomWrapper.swift
//  Clarte
//
//  Wraps LiveKit Room. Add LiveKit Swift SDK via SPM:
//  https://github.com/livekit/client-sdk-swift
//

import Foundation

/// Placeholder until LiveKit Swift SDK is added.
/// Replace with actual Room from livekit-client-sdk-swift.
class LiveKitRoomWrapper {
    func connect(url: String, token: String) async throws {
        // TODO: Add LiveKit Swift SDK and implement:
        // let room = Room()
        // try await room.connect(url: url, token: token, options: ConnectOptions(enableMicrophone: true))
        // Keep room reference for disconnect()
        fatalError("Add LiveKit Swift SDK. See README.")
    }

    func disconnect() {
        // TODO: room.disconnect()
    }
}
