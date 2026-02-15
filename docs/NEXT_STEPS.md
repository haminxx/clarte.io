# What's next (after Firebase + GitHub secrets)

You’ve set up 8 GitHub secrets and connected Firebase (new account + domain). Here’s what’s done and what’s optional.

---

## Done

- **Firebase:** New project (clarte-8aece), new account, domain connected.
- **GitHub Actions:** 8 secrets (service account + 6 Firebase config + `NEXT_PUBLIC_LIVEKIT_URL`).
- **Deploy:** Pushes to `v0/clarte_main` will build and deploy to Firebase Hosting.

---

## Next (in order)

### 1. Confirm deploy

- Push to `v0/clarte_main` (or merge a PR into it).
- In GitHub: **Actions** → check the “Deploy to Firebase Hosting on merge” run.
- When it’s green, open your Firebase Hosting URL (or custom domain). The site should load; login/sign-up use the new Firebase project.

### 2. (Optional) Voice “Start call” button

Right now the **Start call** button will show “Voice not configured” because `NEXT_PUBLIC_VOICE_AGENT_URL` is not set. To make it work:

1. **Render:** Create a **Web Service** (not Background Worker):
   - Connect the same repo, **Root Directory:** `voice-agent`
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `python start_render.py`
   - Add env: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY`, `EXA_API_KEY`
2. After deploy, copy the Web Service **public URL** (e.g. `https://clarte-voice.onrender.com`).
3. **GitHub:** Add secret **NEXT_PUBLIC_VOICE_AGENT_URL** = that URL (no trailing slash).
4. Re-run the deploy workflow (or push a small change) so the new build gets the secret. Then **Start call** will get a token and connect.

### 3. Local dev

In project root, create or update **`.env.local`** with the same values you use in GitHub (at least the `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_LIVEKIT_URL`; add `NEXT_PUBLIC_VOICE_AGENT_URL` when you have the Web Service). Then `npm run dev` will match production behavior.

---

## Summary

| Item | Status |
|------|--------|
| Site on Firebase (new project + domain) | Done |
| Login/sign-up (Firebase Auth) | Works with new project |
| GitHub deploy on push to v0/clarte_main | Set up |
| Voice “Start call” | Optional: add Render Web Service + 9th secret |

You’re good to push and confirm the site and auth. Add the Web Service and `NEXT_PUBLIC_VOICE_AGENT_URL` when you want the voice call to work.
