//
//  VoiceCardView.swift
//  Clarte
//

import SwiftUI

struct VoiceCardView: View {
    @Binding var selectedVoice: VoiceOption
    let onStartCall: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Text("Welcome to Clarte — your Executive Assistant.")
                .font(.headline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Text("Start with voice. Ask Clarte to see your screen or camera when you need it.")
                .font(.caption)
                .foregroundStyle(.tertiary)
                .multilineTextAlignment(.center)

            VStack(alignment: .leading, spacing: 8) {
                Text("Voice:")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Picker("Voice", selection: $selectedVoice) {
                    ForEach(VoiceOption.allCases, id: \.self) { voice in
                        Text(voice.displayName).tag(voice)
                    }
                }
                .pickerStyle(.segmented)
            }

            Button(action: onStartCall) {
                Label("Connect to Assistant", systemImage: "play.fill")
                    .frame(maxWidth: .infinity)
                    .padding()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
