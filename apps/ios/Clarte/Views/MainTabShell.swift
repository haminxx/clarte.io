//
//  MainTabShell.swift
//  Clarte
//

import SwiftUI

enum MainTab: Hashable {
    case home
    case explore
    case library
    case profile
}

struct MainTabShell: View {
    @Environment(SessionManager.self) private var session
    @State private var tab: MainTab = .home
    @State private var vapiCoordinator = VapiCallCoordinator()
    @State private var micMonitor = MicrophoneLevelMonitor()

    var body: some View {
        ZStack(alignment: .bottom) {
            Group {
                switch tab {
                case .home:
                    HomeView(vapi: vapiCoordinator, micMonitor: micMonitor)
                case .explore:
                    placeholderTab(title: "Explore", subtitle: "Coming soon")
                case .library:
                    placeholderTab(title: "Library", subtitle: "Coming soon")
                case .profile:
                    profileTab
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            GlassTabBar(selection: $tab)
        }
    }

    private func placeholderTab(title: String, subtitle: String) -> some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.08, green: 0.1, blue: 0.18), Color.black],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            VStack(spacing: 8) {
                Text(title)
                    .font(.title.bold())
                    .foregroundStyle(.white)
                Text(subtitle)
                    .foregroundStyle(.white.opacity(0.7))
            }
        }
        .padding(.bottom, 88)
    }

    private var profileTab: some View {
        ZStack {
            Color(red: 0.06, green: 0.08, blue: 0.14).ignoresSafeArea()
            VStack(spacing: 16) {
                Text("Profile")
                    .font(.title2.bold())
                    .foregroundStyle(.white)
                if let email = session.currentUser?.email {
                    Text(email)
                        .foregroundStyle(.white.opacity(0.8))
                }
                Button("Sign out") {
                    try? session.signOut()
                }
                .buttonStyle(.borderedProminent)
                .tint(.white.opacity(0.2))
                .foregroundStyle(.white)
            }
        }
        .padding(.bottom, 88)
    }
}

private struct GlassTabBar: View {
    @Binding var selection: MainTab

    var body: some View {
        HStack(spacing: 0) {
            tabButton(.home, "Home", "house.fill")
            tabButton(.explore, "Explore", "safari.fill")
            tabButton(.library, "Library", "books.vertical.fill")
            tabButton(.profile, "Profile", "person.fill")
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 10)
        .background(.ultraThinMaterial, in: Capsule())
        .overlay(
            Capsule()
                .stroke(Color.white.opacity(0.25), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.35), radius: 20, y: 10)
        .padding(.horizontal, 24)
        .padding(.bottom, 18)
    }

    private func tabButton(_ tab: MainTab, _ label: String, _ systemImage: String) -> some View {
        Button {
            selection = tab
        } label: {
            VStack(spacing: 4) {
                Image(systemName: systemImage)
                    .font(.system(size: 20, weight: .medium))
                Text(label)
                    .font(.caption2.weight(.medium))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
            .foregroundStyle(selection == tab ? Color.white : Color.white.opacity(0.55))
            .background {
                if selection == tab {
                    Capsule()
                        .fill(Color.white.opacity(0.18))
                        .padding(.horizontal, -4)
                }
            }
        }
        .buttonStyle(.plain)
    }
}
