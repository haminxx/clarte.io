# Deploy and local CLI (Windows)

## PowerShell blocks `npm` (execution policy)

If you see `npm.ps1 cannot be loaded because running scripts is disabled`:

1. **This repo sets the integrated terminal to Command Prompt** via [`.vscode/settings.json`](../.vscode/settings.json). Reload the window or open a **new** terminal after pulling.
2. Or run: `npm.cmd install` / `npm.cmd run build` instead of `npm`.
3. Or in PowerShell once (if your org allows):  
   `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## Install and build

```bat
npm.cmd ci
npm.cmd run build
```

Output is static HTML in `out/` (Next.js `output: "export"`).

## Firebase Hosting (CI)

Pushing to **`v0/clarte_main`** runs [`.github/workflows/firebase-hosting-merge.yml`](../.github/workflows/firebase-hosting-merge.yml): `npm ci` → `npm run build` → deploy `out/` to project **`clarte-8aece`**.

Required **GitHub Actions secret**:

- `FIREBASE_SERVICE_ACCOUNT_CLARTE_8AECE` — Firebase service account JSON (Project settings → Service accounts → Generate new private key).

Optional secrets (see workflow file for fallbacks): LiveKit, Vapi, Firebase web config, etc.

## Firebase rewrites

Client routes are listed in [`firebase.json`](../firebase.json) so static hosting serves the correct `.html` files. Add a rewrite when you add a new top-level route.

## Vercel

[`vercel.json`](../vercel.json) sets `framework: nextjs`. Connect the repo in the Vercel dashboard if you use Vercel instead of or in addition to Firebase.
