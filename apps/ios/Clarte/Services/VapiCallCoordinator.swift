//
//  VapiCallCoordinator.swift
//  Clarte
//
//  Wraps the Vapi iOS SDK (Daily-based WebRTC). Add Swift package:
//  https://github.com/VapiAI/client-sdk-ios
//

import Combine
import Foundation
import Vapi

@Observable
@MainActor
final class VapiCallCoordinator {
    enum Phase: Equatable {
        case idle
        case connecting
        case active
    }

    private let vapi: Vapi
    private var cancellables = Set<AnyCancellable>()

    var phase: Phase = .idle
    var lastError: String?

    init() {
        let key = Config.vapiPublicKey.trimmingCharacters(in: .whitespacesAndNewlines)
        vapi = Vapi(publicKey: key.isEmpty ? " " : key)
        vapi.eventPublisher
            .receive(on: DispatchQueue.main)
            .sink { [weak self] event in
                guard let self else { return }
                switch event {
                case .callDidStart:
                    self.phase = .active
                case .callDidEnd:
                    self.phase = .idle
                case .error(let error):
                    self.lastError = error.localizedDescription
                    self.phase = .idle
                default:
                    break
                }
            }
            .store(in: &cancellables)
    }

    func startCall() async {
        let key = Config.vapiPublicKey.trimmingCharacters(in: .whitespacesAndNewlines)
        let assistant = Config.vapiAssistantId.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !key.isEmpty, !assistant.isEmpty else {
            lastError = "Set VAPI_PUBLIC_KEY and VAPI_ASSISTANT_ID (Xcode scheme environment variables)."
            return
        }
        phase = .connecting
        lastError = nil
        do {
            _ = try await vapi.start(assistantId: assistant)
        } catch {
            lastError = error.localizedDescription
            phase = .idle
        }
    }

    func stopCall() {
        vapi.stop()
        phase = .idle
    }
}
