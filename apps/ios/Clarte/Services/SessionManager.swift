//
//  SessionManager.swift
//  Clarte
//

import FirebaseAuth
import FirebaseCore
import Foundation
import GoogleSignIn
import SwiftUI
import UIKit

@Observable
final class SessionManager {
    var currentUser: User?
    var authError: String?
    var isAuthLoading = false

    private var authStateHandle: AuthStateDidChangeListenerHandle?

    init() {
        currentUser = Auth.auth().currentUser
        authStateHandle = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            self?.currentUser = user
        }
    }

    deinit {
        if let authStateHandle {
            Auth.auth().removeStateDidChangeListener(authStateHandle)
        }
    }

    var isSignedIn: Bool { currentUser != nil }

    @MainActor
    func signOut() throws {
        try Auth.auth().signOut()
        GIDSignIn.sharedInstance.signOut()
    }

    // MARK: - Email

    @MainActor
    func signInEmail(email: String, password: String) async throws {
        isAuthLoading = true
        authError = nil
        defer { isAuthLoading = false }
        do {
            try await Auth.auth().signIn(withEmail: email, password: password)
        } catch {
            authError = error.localizedDescription
            throw error
        }
    }

    @MainActor
    func signUpEmail(email: String, password: String) async throws {
        isAuthLoading = true
        authError = nil
        defer { isAuthLoading = false }
        do {
            try await Auth.auth().createUser(withEmail: email, password: password)
        } catch {
            authError = error.localizedDescription
            throw error
        }
    }

    // MARK: - Google

    @MainActor
    func signInGoogle() async throws {
        guard let clientID = FirebaseApp.app()?.options.clientID else {
            throw NSError(domain: "Clarte", code: 1, userInfo: [NSLocalizedDescriptionKey: "Missing Firebase client ID (GoogleService-Info.plist)."])
        }
        isAuthLoading = true
        authError = nil
        defer { isAuthLoading = false }

        let config = GIDConfiguration(clientID: clientID)
        GIDSignIn.sharedInstance.configuration = config

        guard let root = AuthUtilities.rootViewController() else {
            throw NSError(domain: "Clarte", code: 2, userInfo: [NSLocalizedDescriptionKey: "No root view controller for Google Sign-In."])
        }

        let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: root)
        guard let idToken = result.user.idToken?.tokenString else {
            throw NSError(domain: "Clarte", code: 3, userInfo: [NSLocalizedDescriptionKey: "Missing Google ID token."])
        }
        let accessToken = result.user.accessToken.tokenString
        let credential = GoogleAuthProvider.credential(withIDToken: idToken, accessToken: accessToken)
        try await Auth.auth().signIn(with: credential)
    }

    // MARK: - Apple (call from ASAuthorizationControllerDelegate callback)

    func firebaseCredentialFromApple(
        idTokenString: String,
        rawNonce: String
    ) async throws {
        isAuthLoading = true
        authError = nil
        defer { isAuthLoading = false }
        do {
            let credential = OAuthProvider.appleCredential(
                withIDToken: idTokenString,
                rawNonce: rawNonce,
                fullName: nil
            )
            try await Auth.auth().signIn(with: credential)
        } catch {
            authError = error.localizedDescription
            throw error
        }
    }
}
