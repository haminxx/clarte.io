//
//  StartClarteIntent.swift
//  Clarte
//
//  App Intent for Siri: "Hey Siri, start Clarte" or "Hey Siri, talk to Clarte"
//  Requires iOS 16+.
//

import AppIntents
import SwiftUI

struct StartClarteIntent: AppIntent {
    static var title: LocalizedStringResource = "Start Clarte"
    static var description = IntentDescription("Start a voice call with Clarte, your AI assistant.")

    func perform() async throws -> some IntentResult {
        // Post notification to open the app and start the call
        NotificationCenter.default.post(name: .startClarteFromSiri, object: nil)
        return .result()
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

extension Notification.Name {
    static let startClarteFromSiri = Notification.Name("startClarteFromSiri")
}
