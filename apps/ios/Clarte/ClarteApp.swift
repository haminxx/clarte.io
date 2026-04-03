//
//  ClarteApp.swift
//  Clarte
//
//  Voice AI assistant for iOS.
//

import FirebaseCore
import SwiftUI

@main
struct ClarteApp: App {
    @State private var session = SessionManager()

    init() {
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
        }
    }

    var body: some Scene {
        WindowGroup {
            AppRootView()
                .environment(session)
        }
    }
}
