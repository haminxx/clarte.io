//
//  WelcomeAnimatedView.swift
//  Clarte
//

import SwiftUI

struct WelcomeAnimatedView: View {
    let onFinished: () -> Void

    @State private var grainSeed = 0
    @State private var grainTimer: Timer?

    var body: some View {
        ZStack {
            backgroundLayer
            NoiseGrainOverlay(seed: grainSeed)
                .opacity(0.2)
                .blendMode(.overlay)
                .allowsHitTesting(false)

            VStack(spacing: 16) {
                Spacer()
                Text("Welcome to Clarte")
                    .font(.system(size: 34, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                    .shadow(color: .black.opacity(0.25), radius: 8, y: 2)

                Text("I'm listening. Let's find some clarity.")
                    .font(.title3.weight(.medium))
                    .foregroundStyle(.white.opacity(0.92))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 28)
                    .shadow(color: .black.opacity(0.2), radius: 6, y: 1)

                Spacer()

                Button(action: onFinished) {
                    Text("Continue")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                }
                .buttonStyle(.borderedProminent)
                .tint(.white.opacity(0.22))
                .foregroundStyle(.white)
                .padding(.horizontal, 36)
                .padding(.bottom, 52)
            }
        }
        .onAppear {
            let t = Timer.scheduledTimer(withTimeInterval: 0.12, repeats: true) { _ in
                grainSeed &+= 1
            }
            RunLoop.main.add(t, forMode: .common)
            grainTimer = t
        }
        .onDisappear {
            grainTimer?.invalidate()
            grainTimer = nil
        }
    }

    private var backgroundLayer: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.02, green: 0.08, blue: 0.22),
                    Color(red: 0.12, green: 0.35, blue: 0.62),
                    Color(red: 0.55, green: 0.78, blue: 0.95),
                ],
                startPoint: .bottomLeading,
                endPoint: .topTrailing
            )
            RadialGradient(
                colors: [
                    Color.white.opacity(0.35),
                    Color.clear,
                ],
                center: .topTrailing,
                startRadius: 40,
                endRadius: 420
            )
        }
        .ignoresSafeArea()
    }
}

private struct NoiseGrainOverlay: View {
    let seed: Int

    var body: some View {
        Canvas { context, size in
            let w = max(1, Int(size.width))
            let h = max(1, Int(size.height))
            let count = min(5000, w * h / 100)
            for i in 0 ..< count {
                let hx = (seed &* 131 &+ i &* 17) &* 2_654_435_761
                let hy = (hx ^ (hx >> 13)) &* 1_597_334_677
                let x = CGFloat((hx % w + w) % w)
                let y = CGFloat((hy % h + h) % h)
                let o = Double(abs((hx ^ hy) % 80)) / 220
                let rect = CGRect(x: x, y: y, width: 1.1, height: 1.1)
                context.fill(Path(ellipseIn: rect), with: .color(.white.opacity(o)))
            }
        }
    }
}
