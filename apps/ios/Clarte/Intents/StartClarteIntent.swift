//
//  StartClarteIntent.swift
//  Clarte
//
//  App Intent: Shortcuts, Siri, Action Button. Presents a snippet; does not open the main UI.
//  Requires iOS 18+ for SnippetIntent / ShowsSnippetView.
//

import AppIntents
import SwiftUI

struct StartClarteIntent: SnippetIntent {
    static var title: LocalizedStringResource = "Start Clarte"
    static var description = IntentDescription("Start a voice session with Clarte, your AI assistant.")

    /// Avoid foregrounding the SwiftUI app when run from Shortcuts or the Action Button.
    static var openAppWhenRun: Bool { false }

    func perform() async throws -> some IntentResult & ShowsSnippetView {
        let granted = await ClarteAudioSession.requestMicrophonePermissionIfNeeded()
        if !granted {
            return .result(view: ClarteVoiceSnippetView(phase: .microphoneDenied))
        }

        do {
            try ClarteAudioSession.configureForVoiceIO()
        } catch {
            return .result(view: ClarteVoiceSnippetView(phase: .audioUnavailable))
        }

        return .result(view: ClarteVoiceSnippetView(phase: .listening))
    }
}

struct StartClarteShortcutsProvider: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: StartClarteIntent(),
            phrases: [
                "Start \(.applicationName)",
                "Talk to \(.applicationName)",
                "Open \(.applicationName)",
            ],
            shortTitle: "Start Clarte",
            systemImageName: "mic.fill"
        )
    }
}
