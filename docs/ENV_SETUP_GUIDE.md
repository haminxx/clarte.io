# Clarte: Environment Variables – Where and What

Voice is powered by **VAPI.ai** (no backend required). Auth and data use **Firebase**.

---

## Step-by-step: Voice (VAPI) on clarte.io

1. **Get your VAPI public key and assistant ID**  
   [VAPI Dashboard](https://dashboard.vapi.ai) → **Keys** (copy **Public key**) → **Assistants** (create or open an assistant, copy its **ID**).

2. **Put them in `.env.local` in the project root**  
   Same folder as `package.json`. Create the file if it doesn’t exist:
   ```bash
   NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_public_key
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id
   ```
   No quotes, no spaces. Use the **public** key only (safe for the browser).

3. **Build and deploy**  
   From the project root:
   ```bash
   npm run build
   firebase deploy
   ```
   The build inlines these values; redeploying without rebuilding will not update them.

4. **Check**  
   Open your site, hard refresh (Ctrl+Shift+R). Click “Start voice call”. If it says “VAPI is not configured”, the build didn’t have the env vars — run step 3 again.

See **docs/VAPI_SETUP.md** for more detail.

---

## Quick: What you need for clarte.io

| Goal | What you need |
|------|----------------|
| **Voice AI works** | In project root `.env.local`: `NEXT_PUBLIC_VAPI_PUBLIC_KEY` and `NEXT_PUBLIC_VAPI_ASSISTANT_ID` (from VAPI Dashboard). Then `npm run build` and redeploy. |
| **Login page works** | Firebase is configured with a fallback for the Clarte project. To use a different project, set all `NEXT_PUBLIC_FIREBASE_*` in `.env.local` and rebuild. |

---

## 1. VAPI (voice – frontend only)

| Key | Value | Notes |
|-----|--------|--------|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Your VAPI **public** key | From dashboard.vapi.ai → Keys. Safe for browser. |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | ID of the assistant to use | From dashboard.vapi.ai → Assistants (create or copy ID). |

**Where to set:** In **`.env.local`** in the project root **before** `npm run build`. For CI (e.g. GitHub Actions), set repo secrets with the same names.

---

## 2. Firebase (frontend build)

Set in **`.env.local`** before `npm run build` (see FIREBASE_HOSTING_SETUP.md):

- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` = from Firebase Console → Project settings → Your apps → Web app.

---

## 3. Summary

| Variable | Meaning | Where to set |
|----------|----------|----------------|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | VAPI public key (voice) | `.env.local` or CI secrets |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | VAPI assistant ID (voice) | `.env.local` or CI secrets |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase config (auth/dashboard) | `.env.local` before build |
