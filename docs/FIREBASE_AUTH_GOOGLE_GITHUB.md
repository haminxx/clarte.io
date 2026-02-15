# Firebase: Connect login with Google, GitHub, and other providers

Your app already uses **Firebase Auth** with **Google** and **GitHub** (sign-in popup) on the login and sign-up pages. To make those buttons work, you need to **enable** each provider in the Firebase Console for your project **clarte-8aece**.

---

## 1. Open Authentication in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select your project **clarte-8aece**.
3. In the left sidebar, click **Build** → **Authentication** (or **Authentication** under “Build”).
4. If you see **Get started**, click it to turn on Authentication.

---

## 2. Enable Google sign-in

1. In **Authentication**, open the **Sign-in method** tab.
2. Find **Google** in the list and click it.
3. Turn the **Enable** toggle **on**.
4. Set **Project support email** (your email; used for OAuth).
5. Click **Save**.

No extra config is needed for the popup flow. Your app’s `authDomain` (e.g. `clarte-8aece.firebaseapp.com`) is already used as the redirect domain.

---

## 3. Enable GitHub sign-in

1. In **Authentication** → **Sign-in method**, find **GitHub** and click it.
2. Turn **Enable** on.
3. You need a **GitHub OAuth App**:
   - Go to [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers).
   - Click **New OAuth App** (or “Register a new application”).
   - **Application name:** e.g. `Clarte`.
   - **Homepage URL:** your site URL (e.g. `https://clarte-8aece.web.app` or your custom domain like `https://clarte.io`).
   - **Authorization callback URL:**  
     `https://<your-auth-domain>/__/auth/handler`  
     Replace `<your-auth-domain>` with your Firebase auth domain, e.g. `clarte-8aece.firebaseapp.com`.  
     Full example: `https://clarte-8aece.firebaseapp.com/__/auth/handler`
   - Click **Register application**.
   - Copy the **Client ID** and generate a **Client secret**.
4. Back in Firebase (GitHub provider):
   - Paste the **Client ID** and **Client secret** from the GitHub OAuth App.
   - Click **Save**.

---

## 4. (Optional) Other providers (e.g. Microsoft, Apple, Email link)

- **Microsoft / Apple / Facebook / Twitter:** In **Sign-in method**, click the provider, turn **Enable** on, and follow the on-screen steps (you’ll create an app in that provider’s dev console and paste Client ID and secret into Firebase).
- **Email/Password:** Already supported in your app for email+password login; ensure **Email/Password** is **Enabled** in **Sign-in method** if you use it.
- **Email link:** In **Sign-in method** → **Email/Password** → enable **Email link** if you want passwordless email links.

---

## 5. Authorized domains (for redirects)

Firebase only allows redirects to **authorized domains**:

1. In **Authentication**, open the **Settings** tab.
2. Go to **Authorized domains**.
3. Ensure your **Firebase Hosting** domain is listed (e.g. `clarte-8aece.web.app`, `clarte-8aece.firebaseapp.com`).
4. If you use a **custom domain** (e.g. `clarte.io`), click **Add domain** and add it.

---

## Summary

| Provider   | Where to enable | Extra step |
|-----------|------------------|------------|
| **Google**  | Auth → Sign-in method → Google → Enable | Set support email, Save. |
| **GitHub**  | Auth → Sign-in method → GitHub → Enable | Create GitHub OAuth App; set callback URL to `https://<auth-domain>/__/auth/handler`; paste Client ID and secret in Firebase. |
| **Others**  | Auth → Sign-in method → [Provider] → Enable | Create app with that provider; paste Client ID and secret. |
| **Domains** | Auth → Settings → Authorized domains | Add your Hosting URL and custom domain. |

After this, **Sign in with Google** and **Sign in with GitHub** on your login/sign-up pages will work, and you can add more providers the same way.
