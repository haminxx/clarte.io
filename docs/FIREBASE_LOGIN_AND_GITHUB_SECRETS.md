# Firebase logout/login and GitHub secrets

---

## Windows: "Scripts are disabled" (PowerShell error)

If you see: *"firebase.ps1 cannot be loaded because running scripts is disabled"*, use **one** of these. You only need to do it once.

### Option A – Use Command Prompt instead of PowerShell (easiest)

1. In Cursor, open a **new** terminal.
2. Click the **dropdown** next to the `+` in the terminal panel (or the `v` arrow).
3. Choose **Command Prompt** (or **cmd**), not PowerShell.
4. Run:
   ```cmd
   firebase logout
   firebase login
   ```
   A browser will open; sign in with the Google account that owns **clarte-8aece**.

### Option B – Allow scripts in PowerShell (current user only)

In PowerShell, run this **once** (type `Y` and Enter if it asks):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run `firebase logout` and `firebase login`.

### Option C – Use npx (works in PowerShell without changing policy)

From your project folder:

```powershell
npx firebase-tools logout
npx firebase-tools login
```

Browser will open; sign in. Then: `npx firebase-tools use clarte-8aece`.

---

## Part 1: Firebase logout and login (your machine)

Firebase CLI uses your **browser** to sign in. You only need to run two commands in a terminal.

### Step 1: Open a terminal

- **Windows:** PowerShell or Command Prompt (or the terminal in Cursor/VS Code).
- **macOS/Linux:** Terminal.

### Step 2: Go to your project folder (optional)

```bash
cd "c:\Users\wildk\OneDrive\Important files\Project Source\App Development\Clarte.io"
```

(You can run the commands from any folder; `firebase` is global.)

### Step 3: Log out of the current Firebase account

```bash
firebase logout
```

You should see something like: `Logged out from <email>` or `Successfully logged out`.

### Step 4: Log in with the account that owns clarte-8aece

```bash
firebase login
```

- A **browser window** will open.
- Sign in with the **Google account** that owns the Firebase project **clarte-8aece**.
- If it says “Firebase CLI wants to access your Google account,” click **Allow**.
- When you see “Success! Logged in as …” in the browser, you can close that tab.
- Back in the terminal you should see: `Success! Logged in as <your-email>`.

### Step 5: Confirm the right project

From your project root (where `firebase.json` and `.firebaserc` are):

```bash
firebase use
```

You should see: `Active Project: clarte-8aece`.  
If not, run: `firebase use clarte-8aece`.

### If something goes wrong

- **“firebase: command not found”**  
  Install the CLI: `npm install -g firebase-tools`, then run `firebase login` again.

- **Browser doesn’t open**  
  Run: `firebase login --no-localhost`  
  Copy the URL from the terminal into your browser, sign in, then paste the code back into the terminal when asked.

- **Wrong Google account**  
  Run `firebase logout` again, then `firebase login` and pick the correct account in the browser.

---

## Part 2: Render – get your service’s public URL

The link you have is the **dashboard** link:

- `https://dashboard.render.com/worker/srv-d692mn0gjchc73dfcivg`

The **public URL** is what the frontend and GitHub need. It’s the URL where your token server actually runs.

1. Open your service in Render: [dashboard link](https://dashboard.render.com/worker/srv-d692mn0gjchc73dfcivg).
2. At the **top** of the page you’ll see the service name and a URL like:
   - `https://<your-service-name>.onrender.com`
3. That `https://...onrender.com` URL (with **no** trailing slash) is your **Render service URL**.  
   Use this for `NEXT_PUBLIC_VOICE_AGENT_URL` everywhere below.

---

## Part 3: GitHub secrets to add

Go to your repo on GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**, and add these **one by one**. Names must match exactly; values stay in GitHub (don’t paste them in chat or commit them).

### 1. Firebase (new project clarte-8aece)

| Secret name | What to put | Where you get it |
|-------------|-------------|------------------|
| `FIREBASE_SERVICE_ACCOUNT_CLARTE_8AECE` | **Entire contents** of the Firebase service account JSON file (one line is fine). | Firebase Console → **clarte-8aece** → Project settings (gear) → **Service accounts** → **Generate new private key** → download the JSON. Open in a text editor and copy **everything** (including `{` and `}`). |

### 2. Firebase config (for the Next.js build)

These are the same values you’d put in a web app in Firebase.  
Firebase Console → **clarte-8aece** → Project settings → **Your apps** → your Web app → “SDK setup and configuration” / config object.

| Secret name | What to put |
|-------------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` from Firebase config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` (e.g. `clarte-8aece.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` (e.g. `clarte-8aece`) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` (e.g. `clarte-8aece.firebasestorage.app`) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` (numeric string) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` (e.g. `1:698398127871:web:...`) |

### 3. Voice (LiveKit + Render)

| Secret name | What to put |
|-------------|-------------|
| `NEXT_PUBLIC_LIVEKIT_URL` | Your LiveKit WebSocket URL (e.g. `wss://clarte-nrk5tnrq.livekit.cloud`) |
| `NEXT_PUBLIC_VOICE_AGENT_URL` | Your **Render service public URL** (e.g. `https://your-service-name.onrender.com`) — **no trailing slash**. This is the URL from Part 2 above. |

---

## How to add each GitHub secret (step-by-step)

1. Open your repo on **GitHub.com** (not in Cursor).
2. Click **Settings** (repo menu).
3. Left sidebar: **Secrets and variables** → **Actions**.
4. Click **New repository secret**.
5. For each secret below:
   - **Name:** type the name **exactly** (copy from the table).
   - **Value:** paste the value (from Firebase Console or Render; never paste keys in chat).
   - Click **Add secret**.
6. Repeat for all 9 secrets.

**Order:** Add **FIREBASE_SERVICE_ACCOUNT_CLARTE_8AECE** first (so deploy works), then the 6 Firebase config secrets, then the 2 voice secrets.

| # | Secret name (copy exactly) | Where you get the value |
|---|----------------------------|--------------------------|
| 1 | `FIREBASE_SERVICE_ACCOUNT_CLARTE_8AECE` | Firebase Console → clarte-8aece → Project settings → Service accounts → Generate new private key → download JSON → open in Notepad → copy **entire** file (from `{` to `}`). |
| 2 | `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → clarte-8aece → Project settings → Your apps → Web app → config → **apiKey** |
| 3 | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same config → **authDomain** |
| 4 | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same config → **projectId** |
| 5 | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same config → **storageBucket** |
| 6 | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same config → **messagingSenderId** |
| 7 | `NEXT_PUBLIC_FIREBASE_APP_ID` | Same config → **appId** |
| 8 | `NEXT_PUBLIC_LIVEKIT_URL` | Your LiveKit URL, e.g. `wss://clarte-nrk5tnrq.livekit.cloud` |
| 9 | `NEXT_PUBLIC_VOICE_AGENT_URL` | Render dashboard → your service → top of page: **public URL** (e.g. `https://xxx.onrender.com`) — **no trailing slash** |

---

## Checklist

- [ ] Ran `firebase logout` then `firebase login` with the account that owns **clarte-8aece**.
- [ ] Ran `firebase use` and see **clarte-8aece**.
- [ ] Got the **public** Render URL from the top of the service page (not the dashboard URL).
- [ ] Added **FIREBASE_SERVICE_ACCOUNT_CLARTE_8AECE** (full JSON) in GitHub Actions secrets.
- [ ] Added all 6 **NEXT_PUBLIC_FIREBASE_*** secrets from Firebase config.
- [ ] Added **NEXT_PUBLIC_LIVEKIT_URL** and **NEXT_PUBLIC_VOICE_AGENT_URL** (Render public URL, no trailing slash).

After that, pushes to `v0/clarte_main` will build with the right env and deploy to Firebase Hosting for **clarte-8aece**, and the site will use Render for voice tokens.
