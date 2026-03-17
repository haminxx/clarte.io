# Custom Domain (clarte.io) Deployment

Firebase Hosting serves the same content for both:
- `clarte-8aece.web.app` (or `*.firebaseapp.com`)
- `clarte.io` (custom domain)

When you push to `v0/clarte_main`, GitHub Actions builds and deploys to Firebase. Both URLs should update.

## If clarte.io shows old content

1. **Hard refresh**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Try incognito/private mode
3. **CDN propagation**: Firebase CDN may take a few minutes to propagate; wait 5–10 minutes after deploy
4. **Verify custom domain**: In [Firebase Console](https://console.firebase.google.com) → Hosting → Custom domains, ensure clarte.io is connected to the same project
5. **DNS**: If you recently added the domain, DNS can take up to 48 hours to propagate

## Permissions

The site requests `microphone` (voice) and `camera` (ASL) permissions. These are allowed via `Permissions-Policy` in firebase.json.
