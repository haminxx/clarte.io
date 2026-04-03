//
//  MicrophoneLevelMonitor.swift
//  Clarte
//

import AVFoundation
import Foundation

/// Drives idle orb visuals from microphone RMS. Stop before starting a Vapi call so Daily can own the mic.
@Observable
final class MicrophoneLevelMonitor {
    var level: Float = 0

    private let engine = AVAudioEngine()
    private var running = false

    func start() async {
        stop()
        guard await ClarteAudioSession.requestMicrophonePermissionIfNeeded() else {
            level = 0
            return
        }
        do {
            try ClarteAudioSession.configureForVoiceIO()
        } catch {
            level = 0
            return
        }
        let input = engine.inputNode
        let format = input.outputFormat(forBus: 0)
        input.removeTap(onBus: 0)
        input.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            let rms = Self.rms(buffer: buffer)
            let smoothed = min(1, max(0, rms * 5))
            Task { @MainActor in
                self?.level = smoothed
            }
        }
        do {
            try engine.start()
            running = true
        } catch {
            level = 0
        }
    }

    func stop() {
        guard running else { return }
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        running = false
        level = 0
        try? ClarteAudioSession.deactivate()
    }

    private static func rms(buffer: AVAudioPCMBuffer) -> Float {
        guard let channel = buffer.floatChannelData else { return 0 }
        let n = Int(buffer.frameLength)
        if n == 0 { return 0 }
        var sum: Float = 0
        let ptr = channel[0]
        for i in 0 ..< n {
            let s = ptr[i]
            sum += s * s
        }
        return sqrt(sum / Float(n))
    }
}
