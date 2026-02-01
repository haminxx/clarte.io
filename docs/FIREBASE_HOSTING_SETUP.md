# Host Clarte on Firebase (instead of Vercel)

You can host the Next.js frontend on **Firebase Hosting** (static) or **Firebase App Hosting**. The Pipecat voice backend stays on Render.com.

---

## Quick setup: Firebase Hosting (static)

Follow these steps in order. The repo is already set up for static export (`output: "export"` in `next.config.mjs` and `firebase.json` with `public: "out"`).

### 1. Install Firebase CLI and log in

```bash
npm install -g firebase-tools
firebase login
```

- A browser window opens; sign in with your Google account (the one that owns your Firebase project).
- When it says “Success! Logged in as …”, you can close the tab and return to the terminal.

### 2. Link your Firebase project (first time only)

From your **project root** (the folder that contains `firebase.json` and `package.json`):

```bash
firebase init hosting
```

- **“How do you want to use Firebase?”** → Use an **existing project** (or create one if needed).
- **“Select a default Firebase project”** → Pick your project (e.g. `clarte-73f7d`).
- **“What do you want to use as your public directory?”** → type **`out`** and press Enter (this is the folder Next.js creates when you run `npm run build` with static export).
- **“Configure as a single-page app?”** → **N** (No).
- **“File firebase.json already exists. Overwrite?”** → **N** (No), so your existing `firebase.json` is kept.

This creates or updates **`.firebaserc`** with your project id. You only need to run `firebase init hosting` once per machine.

### 3. Set environment variables (optional but recommended)

`NEXT_PUBLIC_*` values are baked in at **build time**. Before building, set them so the static site has the right backend URL and Firebase config.

**Windows (PowerShell):**

```powershell
$env:NEXT_PUBLIC_PIPECAT_BACKEND_URL = "https://YOUR-RENDER-SERVICE.onrender.com"
$env:NEXT_PUBLIC_FIREBASE_API_KEY = "your-firebase-api-key"
$env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "your-project.firebaseapp.com"
$env:NEXT_PUBLIC_FIREBASE_PROJECT_ID = "your-project-id"
$env:NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "your-project.appspot.com"
$env:NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "your-sender-id"
$env:NEXT_PUBLIC_FIREBASE_APP_ID = "your-app-id"
```

**macOS / Linux (bash):**

```bash
export NEXT_PUBLIC_PIPECAT_BACKEND_URL="https://YOUR-RENDER-SERVICE.onrender.com"
export NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
# ... same keys as above
```

Or use a **`.env.local`** file in the project root (do not commit it; it’s in `.gitignore`). Then run `npm run build`; Next.js will read `.env.local` when building.

### 4. Build the static site

```bash
npm install
npm run build
```

This creates an **`out/`** folder with the static export.

### 5. Deploy to Firebase Hosting

```bash
firebase deploy
```

When it finishes, the CLI shows your Hosting URL, e.g.:

- **Hosting URL:** `https://<project-id>.web.app`

Open that URL to see your site. Voice (“Start voice call”) will work if you set `NEXT_PUBLIC_PIPECAT_BACKEND_URL` to your Render backend URL before building.

### 6. (Optional) Add a custom domain

1. In [Firebase Console](https://console.firebase.google.com/) → your project → **Hosting**.
2. Click **Add custom domain** and follow the steps (e.g. `www.clarte.io`).
3. Add the DNS records Firebase shows at your domain registrar; after they propagate, Firebase will serve your site on that domain.

---

## Prerequisites (reference)

1. **Firebase project** – Same project you use for Auth/Firestore (e.g. `clarte-73f7d`).
2. **Firebase CLI** – `npm install -g firebase-tools` then `firebase login`.

---

## Option A: Firebase App Hosting (recommended for full Next.js)

Best if you want **SSR, API routes, and dynamic routes** without changing the app.

1. In [Firebase Console](https://console.firebase.google.com/) → your project → **Build** → **App Hosting**.
2. **Get started** → connect your **GitHub** repo (`haminxx/clarte.io`).
3. Select the repo and branch (e.g. `v0/clarte_main`).
4. Firebase detects Next.js and sets build/deploy. Adjust **Root directory** if needed (leave blank if the app is at repo root).
5. **Environment variables**: Add the same vars you use on Vercel, e.g.  
   `NEXT_PUBLIC_PIPECAT_BACKEND_URL`, `NEXT_PUBLIC_FIREBASE_*`.
6. Save and deploy. Firebase builds and hosts the app; you get a URL like `https://<app-id>.web.app`.

**No code changes needed** – no `firebase.json` or `output: 'export'` required. App Hosting runs Next.js with SSR.

---

## Option B: Static export to Firebase Hosting (classic)

Use this if you prefer **Firebase Hosting** (static files only). The repo is already configured: **`next.config.mjs`** has `output: "export"` and **`firebase.json`** has `public: "out"`. API routes have been removed for static export; the voice flow still uses your Render backend.

### 1. Enable static export in Next.js

Already done in this repo. If you ever need to re-enable:

In **`next.config.mjs`**, set `output: "export"` in the config object, then run `npm run build` to produce the **`out/`** folder.

### 2. Link Firebase project

From the project root:

```bash
firebase login
firebase init hosting
```

- “Use an existing project” → select your Firebase project (e.g. `clarte-73f7d`).
- “What do you want to use as your public directory?” → **`out`** (the Next.js static export folder).
- Single-page app: **No** (Next.js export is multi-page).
- Overwrite `firebase.json` if prompted: **No** (we already have one that uses `out`).

This creates or updates **`.firebaserc`** with your project id.

### 3. Build and deploy

```bash
npm run build
firebase deploy
```

Your site will be at `https://<project-id>.web.app` and `https://<project-id>.firebaseapp.com`.

### 4. Environment variables (static export)

`NEXT_PUBLIC_*` values are **baked in at build time**. You can’t change them in the Firebase Console after deploy. So:

- Build locally (or in CI) with the right env:  
  `NEXT_PUBLIC_PIPECAT_BACKEND_URL=https://your-render-url.onrender.com`  
  `NEXT_PUBLIC_FIREBASE_*` from your Firebase project.
- Or use Firebase App Hosting (Option A), which supports build-time env vars in the console.

### Notes for static export

- **API routes** (e.g. `app/api/export/route.ts`) are **not** supported with `output: "export"`. Remove or stub them, or use Option A (App Hosting).
- Voice: **Start voice call** still works: the frontend calls your **Render** backend (`NEXT_PUBLIC_PIPECAT_BACKEND_URL`), so no backend is needed on Firebase for that.

---

## What to set in Firebase (both options)

| Item | Where | What |
|------|--------|------|
| **Firebase project** | Console → Project settings | Same as Auth/Firestore (e.g. `clarte-73f7d`) |
| **Custom domain** | Hosting → Add custom domain | e.g. `www.clarte.io` (point DNS to Firebase) |
| **Env vars** | App Hosting build config, or build script for static | `NEXT_PUBLIC_PIPECAT_BACKEND_URL`, `NEXT_PUBLIC_FIREBASE_*` |

---

## After moving from Vercel

1. **DNS**: Point your domain (e.g. `www.clarte.io`) to Firebase Hosting (see Hosting → Add custom domain for the records).
2. **Vercel**: You can leave the project in place or delete it; traffic will go to Firebase once DNS is updated.
3. **Backend**: No change – Render remains the Pipecat backend; set `NEXT_PUBLIC_PIPECAT_BACKEND_URL` in Firebase (App Hosting env or build env for static).
