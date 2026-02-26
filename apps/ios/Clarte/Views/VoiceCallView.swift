//
//  VoiceCallView.swift
//  Clarte
//
//  LiveKit voice call UI. Requires LiveKit Swift SDK.
//

import SwiftUI

struct VoiceCallView: View {
    let voice: String
    let onDisconnect: () -> Void

    @State private var status: CallStatus = .connecting
    @State private var errorMessage: String?
    @State private var room: LiveKitRoomWrapper?

    var body: some View {
        VStack(spacing: 24) {
            switch status {
            case .connecting:
                ProgressView("Connecting…")
            case .active:
                Text("In call")
                    .font(.title2)
                Button("End call", role: .destructive) {
                    room?.disconnect()
                    onDisconnect()
                }
            case .error:
                if let msg = errorMessage {
                    Text(msg)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }
                Button("Back") {
                    onDisconnect()
                }
            }

            Spacer()
        }
        .padding()
        .task {
            await connect()
        }
    }

    private func connect() async {
        // Token and LiveKit URL should come from Config/Environment
        guard let token = await TokenService.shared.fetchToken(voice: voice),
              let url = Config.liveKitURL else {
            status = .error
            errorMessage = "Missing token or LiveKit URL. Set Config values."
            return
        }

        let wrapper = LiveKitRoomWrapper()
        room = wrapper

        do {
            try await wrapper.connect(url: url, token: token)
            status = .active
        } catch {
            status = .error
            errorMessage = error.localizedDescription
        }
    }
}

enum CallStatus {
    case connecting
    case active
    case error
}
