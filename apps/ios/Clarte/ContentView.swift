//
//  ContentView.swift
//  Clarte
//
//  Legacy preview helper. The app entry uses AppRootView.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        AppRootView()
            .environment(SessionManager())
    }
}

#Preview("Welcome") {
    WelcomeAnimatedView(onFinished: {})
}
