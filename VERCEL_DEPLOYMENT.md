# 🚀 Vercel Deployment Guide

## ✅ Issues Fixed

1. **Removed Next.js dependency** - Project is Vite/React, not Next.js
2. **Fixed build script** - Changed from `next build` to `tsc && vite build`
3. **Created `vercel.json`** - Explicitly tells Vercel this is a Vite project

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Before deploying, you need to set these in Vercel:

**In Vercel Dashboard → Settings → Environment Variables:**

- `VITE_BACKEND_URL` = Your backend URL (e.g., `https://your-backend.railway.app`)

**Note:** The backend URL should be your deployed backend (Railway, Render, etc.), not `localhost:8000`

### 2. Build Configuration

✅ **Already configured:**
- `vercel.json` created with correct Vite settings
- `package.json` build script fixed
- Output directory set to `dist`

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to:** https://vercel.com
2. **Sign up/Login** (GitHub account works)
3. **Click:** "Add New Project"
4. **Import your repository** (connect GitHub/GitLab/Bitbucket)
5. **Configure:**
   - Framework Preset: **Vite** (should auto-detect)
   - Root Directory: `.` (root)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `dist` (auto-filled)
   - Install Command: `npm install` (auto-filled)
6. **Add Environment Variable:**
   - Key: `VITE_BACKEND_URL`
   - Value: Your backend URL (e.g., `https://your-backend.railway.app`)
7. **Click:** "Deploy"
8. **Wait for build** (usually 1-2 minutes)
9. **Get your URL:** `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow prompts:**
   - Link to existing project? **No** (first time)
   - Project name: `clarte-ui` (or your choice)
   - Directory: `.` (current directory)
   - Override settings? **No**

5. **Set environment variable:**
   ```bash
   vercel env add VITE_BACKEND_URL
   ```
   Enter your backend URL when prompted.

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## 🔍 Troubleshooting

### Error: "routes-manifest.json not found"
✅ **Fixed!** This was caused by Next.js detection. Now fixed with:
- Removed `next` dependency
- Fixed build script
- Added `vercel.json`

### Build Fails: "Cannot find module"
**Solution:** Make sure all dependencies are in `package.json`:
```bash
npm install
```

### Build Succeeds but App Shows Blank Screen
**Check:**
1. Environment variable `VITE_BACKEND_URL` is set correctly
2. Backend is deployed and accessible
3. CORS is enabled on backend
4. Check browser console (F12) for errors

### Microphone Not Working
**Solution:** HTTPS is required for microphone access. Vercel provides HTTPS automatically, so this should work once deployed.

## 📝 Post-Deployment

### 1. Test Your Deployment

1. **Open your Vercel URL:** `https://your-app.vercel.app`
2. **Click microphone button**
3. **Allow microphone access** (browser will prompt)
4. **Speak:** "What is anxiety?"
5. **Verify:** Response appears and audio plays

### 2. Update Backend CORS (if needed)

Make sure your backend allows requests from your Vercel domain:

**In `clarte_backend_api.py`:**
```python
from flask_cors import CORS

# Allow your Vercel domain
CORS(app, origins=[
    "https://your-app.vercel.app",
    "https://*.vercel.app"  # Allow all Vercel preview deployments
])
```

### 3. Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 🎯 Summary

✅ **Fixed Issues:**
- Removed Next.js confusion
- Fixed build script
- Created `vercel.json` configuration

✅ **Ready to Deploy:**
- Build command: `npm run build`
- Output: `dist/` folder
- Framework: Vite

✅ **Next Steps:**
1. Deploy backend (Railway/Render)
2. Set `VITE_BACKEND_URL` in Vercel
3. Deploy frontend to Vercel
4. Test microphone access

---

**Need help?** Check Vercel logs in Dashboard → Deployments → Click on deployment → View Function Logs
