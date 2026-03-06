# Deployment & branches

## Which version is on the live website?

The **deployed (production) website** is built and published from the branch:

- **`v0/clarte_main`**

Deployment is triggered by **Firebase Hosting** when you **push** to `v0/clarte_main` (see `.github/workflows/firebase-hosting-merge.yml`).

So the **applied version** on the site is always the latest commit on `v0/clarte_main` that has been pushed to GitHub.

## How to get changes live

1. **Push to `v0/clarte_main`** (or merge a PR into `v0/clarte_main`). Only this branch triggers the Firebase Hosting deploy.
2. After the push, check the **GitHub Actions** tab for the workflow **"Deploy to Firebase Hosting on merge"**. When it turns green, the new version is live.
3. **Voice demo:** For the live site, set the build-time env vars `NEXT_PUBLIC_VOICE_AGENT_URL` and `NEXT_PUBLIC_LIVEKIT_URL` where the site is built (e.g. GitHub Actions secrets used by the Firebase Hosting workflow). Otherwise the demo cannot reach the token server.

## Feature branches

Work that is only on other branches (e.g. `feature/ambient-background-glow`, `master`) is **not** on the live site until it is merged into `v0/clarte_main` and that merge is pushed.

### Example: Dark Mode Ambient Radial Glow

- The ambient background changes are on branch **`feature/ambient-background-glow`**.
- They are **not** on the deployed site until you merge that branch into **`v0/clarte_main`** and push.

**To get the ambient background live:**

1. In your **main repo** (where `v0/clarte_main` is checked out):
   ```bash
   git fetch origin
   git checkout v0/clarte_main
   git pull origin v0/clarte_main
   git merge origin/feature/ambient-background-glow -m "Merge feature/ambient-background-glow: Dark Mode Ambient Radial Glow"
   git push origin v0/clarte_main
   ```
2. After the push, the Firebase Hosting workflow will run and deploy the new version.

Or open a Pull Request on GitHub from `feature/ambient-background-glow` into `v0/clarte_main`, review, and merge; then the next deploy will include the changes.
