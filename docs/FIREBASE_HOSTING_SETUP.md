# Host Clarte on Firebase (instead of Vercel)

You can host the Next.js frontend on **Firebase Hosting** or **Firebase App Hosting**. The Pipecat voice backend stays on Render.com.

---

## Prerequisites

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

Use this if you prefer **Firebase Hosting** (static files only). Your app will be **statically exported**; **API routes will not run** on Firebase (the voice flow still uses your Render backend).

### 1. Enable static export in Next.js

In **`next.config.mjs`**, set:

```js
const nextConfig = {
  output: "export",
  // ... rest of your config
}
```

Then run:

```bash
npm run build
```

This produces an **`out/`** folder (and may fail if you have API routes or unsupported features; see notes below).

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
