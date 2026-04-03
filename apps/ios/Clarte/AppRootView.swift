//
//  AppRootView.swift
//  Clarte
//

import SwiftUI

struct AppRootView: View {
    @Environment(SessionManager.self) private var session
    @AppStorage("hasSeenWelcome") private var hasSeenWelcome = false

    var body: some View {
        Group {
            if session.isSignedIn {
                MainTabShell()
            } else if !hasSeenWelcome {
                WelcomeAnimatedView {
                    hasSeenWelcome = true
                }
            } else {
                AuthView(session: session)
            }
        }
    }
}
