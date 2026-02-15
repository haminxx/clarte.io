# Where to set environment variables

Auth and data use **Firebase**. Set frontend env in project root `.env.local` (gitignored).

---

## Frontend (Next.js)

| Variable | Where to set it |
|----------|------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Project root `.env.local` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Project root `.env.local` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project root `.env.local` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Project root `.env.local` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Project root `.env.local` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Project root `.env.local` |

From Firebase Console → Project settings → Your apps → Web app.

For **GitHub Actions** (Firebase Hosting build): add any `NEXT_PUBLIC_*` you need as repository secrets. Firebase Hosting only serves the built files; the build runs in GitHub Actions.
