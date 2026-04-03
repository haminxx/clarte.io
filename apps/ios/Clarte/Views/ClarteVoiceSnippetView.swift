//
//  ClarteVoiceSnippetView.swift
//  Clarte
//
//  Minimal App Intent snippet UI (Siri-like). Replace styling when design is ready.
//

import SwiftUI

enum ClarteVoicePhase: Equatable {
    case listening
    case thinking
    case speaking
    /// Microphone permission denied or unavailable.
    case microphoneDenied
    /// Session activation failed (rare).
    case audioUnavailable

    var title: String {
        switch self {
        case .listening: return "Listening"
        case .thinking: return "Thinking"
        case .speaking: return "Speaking"
        case .microphoneDenied: return "Microphone off"
        case .audioUnavailable: return "Audio unavailable"
        }
    }

    var systemImage: String {
        switch self {
        case .listening: return "mic.fill"
        case .thinking: return "ellipsis.circle.fill"
        case .speaking: return "waveform"
        case .microphoneDenied: return "mic.slash.fill"
        case .audioUnavailable: return "exclamationmark.triangle.fill"
        }
    }
}

struct ClarteVoiceSnippetView: View {
    let phase: ClarteVoicePhase

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: phase.systemImage)
                .font(.title2)
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(phase == .thinking ? .secondary : .primary)

            VStack(alignment: .leading, spacing: 2) {
                Text("Clarte")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(phase.title)
                    .font(.headline)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

#Preview("Listening") {
    ClarteVoiceSnippetView(phase: .listening)
}

#Preview("Thinking") {
    ClarteVoiceSnippetView(phase: .thinking)
}

#Preview("Denied") {
    ClarteVoiceSnippetView(phase: .microphoneDenied)
}
