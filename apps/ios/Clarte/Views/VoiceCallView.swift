//
//  VoiceCallView.swift
//  Clarte
//
//  Optional Tier 2 (LiveKit) full-screen call. Primary flow is Vapi from HomeView.
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
        guard let token = await TokenService.shared.fetchToken(voice: voice),
              let url = Config.liveKitURL else {
            status = .error
            errorMessage = "Missing token or LiveKit URL. Tier 1 voice uses Vapi from the home screen."
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
