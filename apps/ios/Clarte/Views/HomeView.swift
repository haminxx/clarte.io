//
//  HomeView.swift
//  Clarte
//

import SwiftUI

struct HomeView: View {
    @Environment(SessionManager.self) private var session
    var vapi: VapiCallCoordinator
    @Bindable var micMonitor: MicrophoneLevelMonitor

    private let backgroundImageURL = URL(string: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80")

    var body: some View {
        ZStack {
            AsyncImage(url: backgroundImageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                default:
                    LinearGradient(
                        colors: [Color(red: 0.2, green: 0.35, blue: 0.5), Color(red: 0.05, green: 0.1, blue: 0.2)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                }
            }
            .ignoresSafeArea()
            .overlay {
                LinearGradient(
                    colors: [.black.opacity(0.35), .black.opacity(0.55), .black.opacity(0.25)],
                    startPoint: .top,
                    endPoint: .bottom
                )
            }

            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    header
                    nowForYouSection
                    Spacer(minLength: 120)
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
            }

            VStack {
                Spacer()
                VoiceOrbView(
                    monitor: micMonitor,
                    isCallActive: vapi.phase == .active || vapi.phase == .connecting
                ) {
                    Task { await handleOrbTap() }
                }
                .padding(.bottom, 120)
            }

            if vapi.phase == .connecting {
                ProgressView("Connecting…")
                    .tint(.white)
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
            }

            if let err = vapi.lastError {
                Text(err)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .padding(8)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
                    .padding(.top, 60)
            }
        }
        .task {
            await micMonitor.start()
        }
        .onChange(of: vapi.phase) { _, new in
            if new == .active || new == .connecting {
                micMonitor.stop()
            } else if new == .idle {
                Task { await micMonitor.start() }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(greeting)
                .font(.largeTitle.bold())
                .foregroundStyle(.white)
            if let name = session.currentUser?.displayName, !name.isEmpty {
                Text(name)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.9))
            } else if let email = session.currentUser?.email {
                Text(email)
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.75))
            }
        }
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5 ..< 12: return "Good morning"
        case 12 ..< 17: return "Good afternoon"
        case 17 ..< 22: return "Good evening"
        default: return "Good day"
        }
    }

    private var nowForYouSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Now for you", systemImage: "sparkle")
                .font(.headline.weight(.semibold))
                .foregroundStyle(.white)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    glassCard(title: "Focus", systemImage: "scope")
                    glassCard(title: "Quick rest", systemImage: "moon.zzz.fill")
                    glassCard(title: "Breath", systemImage: "leaf.fill")
                }
            }
        }
    }

    private func glassCard(title: String, systemImage: String) -> some View {
        VStack(spacing: 10) {
            Image(systemName: systemImage)
                .font(.title2)
                .foregroundStyle(.white)
            Text(title)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.white.opacity(0.95))
        }
        .frame(width: 120, height: 100)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.2), lineWidth: 1)
        )
    }

    @MainActor
    private func handleOrbTap() async {
        switch vapi.phase {
        case .idle:
            micMonitor.stop()
            await vapi.startCall()
        case .connecting, .active:
            vapi.stopCall()
        }
    }
}
