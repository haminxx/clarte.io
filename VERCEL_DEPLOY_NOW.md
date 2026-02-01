# 🚀 Deploy to Vercel - Step by Step

## ✅ Prerequisites Check

- ✅ Code committed locally
- ✅ GitHub repository: `https://github.com/haminxx/clarte.io.git`
- ⚠️ **Make sure you've pushed to GitHub first!**

## Step 1: Push to GitHub (If Not Done Yet)

If you haven't pushed yet, run this in terminal:

```powershell
cd "C:\Users\wildk\OneDrive\Important files\Project Source\App Development\Clarte.io"
.\PortableGit\cmd\git.exe push -u origin main
```

**When prompted:**
- Username: `haminxx`
- Password: Your GitHub Personal Access Token (not your password)

## Step 2: Deploy to Vercel (Web Interface)

### 2.1 Go to Vercel
1. Open browser: https://vercel.com
2. **Sign up** or **Log in** (use GitHub account for easiest setup)

### 2.2 Import Your Project
1. Click **"Add New Project"** (or **"Import Project"**)
2. You'll see a list of your GitHub repositories
3. **Find and click:** `haminxx/clarte.io`
4. Click **"Import"**

### 2.3 Configure Project Settings

Vercel should auto-detect Vite, but verify these settings:

**Framework Preset:** `Vite` (should auto-detect)

**Root Directory:** `.` (leave as default)

**Build Command:** `npm run build` (should auto-fill)

**Output Directory:** `dist` (should auto-fill)

**Install Command:** `npm install` (should auto-fill)

### 2.4 Add Environment Variable

**IMPORTANT:** Add this environment variable:

1. Scroll down to **"Environment Variables"** section
2. Click **"Add"** or **"Add Environment Variable"**
3. **Key:** `VITE_BACKEND_URL`
4. **Value:** Your backend URL
   - If backend is deployed: `https://your-backend.railway.app` (or your backend URL)
   - If testing locally: `http://localhost:8000` (but this won't work in production)
5. **Environment:** Select all (Production, Preview, Development)
6. Click **"Add"**

### 2.5 Deploy!

1. Click **"Deploy"** button (bottom right)
2. Wait 1-2 minutes for build to complete
3. You'll see build logs in real-time
4. When done, you'll get a URL like: `https://clarte-io.vercel.app`

## Step 3: Test Your Deployment

1. **Open your Vercel URL** (e.g., `https://clarte-io.vercel.app`)
2. **Click the microphone button**
3. **Allow microphone access** when browser prompts
4. **Speak:** "What is anxiety?"
5. **Verify:** Response appears and audio plays! 🎉

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project imported
- [ ] Environment variable `VITE_BACKEND_URL` set
- [ ] Build completed successfully
- [ ] App loads at Vercel URL
- [ ] Microphone access works (HTTPS required)
- [ ] Voice input works
- [ ] Backend connection works

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify `package.json` has correct build script
- Check for TypeScript errors

### App Shows Blank Screen
- Check browser console (F12)
- Verify `VITE_BACKEND_URL` is set correctly
- Make sure backend is deployed and accessible

### Microphone Not Working
- HTTPS is required - Vercel provides this automatically
- Check browser permissions (lock icon in address bar)
- Try different browser (Chrome/Edge recommended)

### Backend Connection Failed
- Verify backend is deployed (Railway/Render/etc.)
- Check `VITE_BACKEND_URL` matches your backend URL
- Verify CORS is enabled on backend
- Check backend logs for errors

## 🎯 Next Steps After Deployment

1. **Deploy Backend** (if not done):
   - Railway: https://railway.app
   - Render: https://render.com
   - Or any Python hosting service

2. **Update Environment Variable:**
   - In Vercel dashboard → Settings → Environment Variables
   - Update `VITE_BACKEND_URL` to your production backend URL

3. **Test End-to-End:**
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://your-backend.railway.app`
   - Full pipeline: Microphone → LLM → TTS → Audio

---

**You don't need terminal commands for Vercel!** Just use the web interface at vercel.com
