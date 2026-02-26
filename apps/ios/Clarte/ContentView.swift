//
//  ContentView.swift
//  Clarte
//

import SwiftUI

struct ContentView: View {
    @State private var inCall = false
    @State private var selectedVoice: VoiceOption = .cedar

    var body: some View {
        NavigationStack {
            if inCall {
                VoiceCallView(
                    voice: selectedVoice.rawValue,
                    onDisconnect: { inCall = false }
                )
            } else {
                VoiceCardView(
                    selectedVoice: $selectedVoice,
                    onStartCall: { inCall = true }
                )
            }
        }
    }
}

enum VoiceOption: String, CaseIterable {
    case marin = "marin"
    case cedar = "cedar"

    var displayName: String {
        switch self {
        case .marin: return "Marin"
        case .cedar: return "Cedar"
        }
    }
}

#Preview {
    ContentView()
}
