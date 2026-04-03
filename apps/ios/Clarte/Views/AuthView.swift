//
//  AuthView.swift
//  Clarte
//

import AuthenticationServices
import SwiftUI

struct AuthView: View {
    @Bindable var session: SessionManager
    @State private var showEmailForm = false
    @State private var email = ""
    @State private var password = ""
    @State private var isRegisterMode = false
    @State private var appleNonce: String?

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.05, green: 0.12, blue: 0.28),
                    Color(red: 0.1, green: 0.2, blue: 0.45),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    Text("Clarte")
                        .font(.largeTitle.bold())
                        .foregroundStyle(.white)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Sign in")
                            .font(.title2.weight(.semibold))
                            .foregroundStyle(.primary)
                        Text("Continue with your preferred method.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    VStack(spacing: 12) {
                        SignInWithAppleButton(.signIn) { request in
                            let nonce = AuthUtilities.randomNonceString()
                            appleNonce = nonce
                            request.requestedScopes = [.fullName, .email]
                            request.nonce = AuthUtilities.sha256(nonce)
                        } onCompletion: { result in
                            handleAppleCompletion(result)
                        }
                        .signInWithAppleButtonStyle(.white)
                        .frame(height: 50)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                        Button {
                            Task { await signInGoogle() }
                        } label: {
                            Label("Continue with Google", systemImage: "globe")
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.white)
                        .foregroundStyle(.black)

                        Button {
                            showEmailForm.toggle()
                        } label: {
                            Label("Continue with Email", systemImage: "envelope.fill")
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                        }
                        .buttonStyle(.bordered)
                        .tint(.white.opacity(0.9))
                    }

                    if showEmailForm {
                        VStack(spacing: 12) {
            TextField("Email", text: $email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                                .padding()
                                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))

                            SecureField("Password", text: $password)
                                .textContentType(isRegisterMode ? .newPassword : .password)
                                .padding()
                                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))

                            Toggle("Create new account", isOn: $isRegisterMode)

                            Button {
                                Task { await submitEmail() }
                            } label: {
                                Text(isRegisterMode ? "Create account" : "Sign in")
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                            }
                            .buttonStyle(.borderedProminent)
                            .disabled(session.isAuthLoading || email.isEmpty || password.count < 6)
                        }
                    }

                    if let err = session.authError {
                        Text(err)
                            .font(.caption)
                            .foregroundStyle(.red)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(24)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 24))
                .padding(.horizontal, 20)
            }
        }
    }

    private func handleAppleCompletion(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .failure(let error):
            session.authError = error.localizedDescription
        case .success(let authorization):
            guard let apple = authorization.credential as? ASAuthorizationAppleIDCredential,
                  let tokenData = apple.identityToken,
                  let idToken = String(data: tokenData, encoding: .utf8),
                  let nonce = appleNonce else {
                session.authError = "Apple Sign-In failed: missing token."
                return
            }
            Task {
                do {
                    try await session.firebaseCredentialFromApple(idTokenString: idToken, rawNonce: nonce)
                } catch {
                    session.authError = error.localizedDescription
                }
            }
        }
    }

    @MainActor
    private func signInGoogle() async {
        do {
            try await session.signInGoogle()
        } catch {
            session.authError = error.localizedDescription
        }
    }

    @MainActor
    private func submitEmail() async {
        do {
            if isRegisterMode {
                try await session.signUpEmail(email: email, password: password)
            } else {
                try await session.signInEmail(email: email, password: password)
            }
        } catch {
            session.authError = error.localizedDescription
        }
    }
}
