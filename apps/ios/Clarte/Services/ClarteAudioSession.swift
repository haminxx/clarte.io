//
//  ClarteAudioSession.swift
//  Clarte
//
//  AVAudioSession setup for voice capture and playback (App Intent / in-app).
//

import AVFoundation

enum ClarteAudioSession {
    /// Requests mic access if not yet determined; returns current granted state after the prompt or immediately if already decided.
    static func requestMicrophonePermissionIfNeeded() async -> Bool {
        await withCheckedContinuation { continuation in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                continuation.resume(returning: granted)
            }
        }
    }

    /// Configures play/record for conversational voice (voice chat mode, speaker + Bluetooth).
    static func configureForVoiceIO() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(
            .playAndRecord,
            mode: .voiceChat,
            options: [.defaultToSpeaker, .allowBluetooth]
        )
        try session.setActive(true, options: [])
    }

    static func deactivate() throws {
        try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
}
