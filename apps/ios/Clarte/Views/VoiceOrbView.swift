//
//  VoiceOrbView.swift
//  Clarte
//

import SwiftUI

struct VoiceOrbView: View {
    @Bindable var monitor: MicrophoneLevelMonitor
    var isCallActive: Bool
    var onTap: () -> Void

    private var pulse: CGFloat {
        isCallActive ? 1.08 : 1 + CGFloat(monitor.level) * 0.12
    }

    var body: some View {
        Button(action: onTap) {
            ZStack {
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [
                                Color(red: 0.45, green: 0.65, blue: 1),
                                Color(red: 0.15, green: 0.25, blue: 0.75),
                                Color(red: 0.05, green: 0.08, blue: 0.35),
                            ],
                            center: .topLeading,
                            startRadius: 8,
                            endRadius: 140
                        )
                    )
                    .frame(width: 200, height: 200)
                    .shadow(color: .blue.opacity(0.45), radius: 24, y: 8)

                Circle()
                    .stroke(Color.white.opacity(0.35), lineWidth: 2)
                    .frame(width: 208, height: 208)

                Image(systemName: isCallActive ? "waveform" : "mic.fill")
                    .font(.system(size: 44, weight: .medium))
                    .foregroundStyle(.white.opacity(isCallActive ? 1 : 0.92))
            }
            .scaleEffect(pulse)
            .animation(.easeInOut(duration: 0.18), value: monitor.level)
            .animation(.easeInOut(duration: 0.35), value: isCallActive)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(isCallActive ? "End conversation" : "Start conversation with Clarte")
    }
}
