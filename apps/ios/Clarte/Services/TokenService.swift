//
//  TokenService.swift
//  Clarte
//
//  Fetches LiveKit token from Render token server or /api/token.
//

import Foundation

actor TokenService {
    static let shared = TokenService()

    func fetchToken(voice: String) async -> String? {
        let baseURL = Config.voiceAgentURL
        let tokenURL = baseURL.isEmpty
            ? URL(string: "https://clarte.io/api/token")!
            : URL(string: "\(baseURL.hasSuffix("/") ? String(baseURL.dropLast()) : baseURL)/token")!

        var request = URLRequest(url: tokenURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONEncoder().encode(TokenRequest(voice: voice, mode: "casual"))

        guard let (data, _) = try? await URLSession.shared.data(for: request),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let token = json["token"] as? String else {
            return nil
        }
        return token
    }
}

private struct TokenRequest: Encodable {
    let voice: String
    let mode: String
}
