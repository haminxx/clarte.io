# Clarte Voice – VAPI.ai Setup

Voice on Clarte is powered by **VAPI.ai**. No backend (Render/Pipecat) is required for voice; the frontend talks directly to VAPI using your **public key** and **assistant ID**.

## 1. Get your VAPI keys and create an assistant

1. Sign up at [vapi.ai](https://vapi.ai) and open the [VAPI Dashboard](https://dashboard.vapi.ai).
2. **Public key** (for the browser): Dashboard → **Keys** → copy your **Public key**. This is safe to use in the frontend (`NEXT_PUBLIC_VAPI_PUBLIC_KEY`).
3. **Assistant**: Create an assistant in the dashboard (name, model, voice, system prompt). Copy the **Assistant ID** (e.g. from the assistant’s URL or settings).

## 2. Set environment variables (frontend)

In the **project root** (same folder as `package.json`), create or edit **`.env.local`**:

```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_public_key_from_dashboard
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id
```

- No quotes, no spaces.
- **Public key** only (not the private/secret key).
- Rebuild and redeploy after changing these (`npm run build` then `firebase deploy` or push to trigger CI).

## 3. GitHub Actions (optional)

If you deploy via GitHub Actions, add **Secrets** in the repo:

- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` – your VAPI public key
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID` – your assistant ID

The workflow uses these during `npm run build` so the deployed site has voice configured.

## 4. Summary

| Variable | Meaning | Where |
|----------|--------|--------|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | VAPI public key (browser-safe) | `.env.local` or GitHub Secrets |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | ID of the assistant to use for “Start voice call” | `.env.local` or GitHub Secrets |

Firebase (auth, Firestore) is unchanged; only the voice stack now uses VAPI instead of Pipecat/Daily.
