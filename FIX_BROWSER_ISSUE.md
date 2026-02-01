# 🔧 Fix Browser Connection Issue

## Common Issues & Solutions

### Issue 1: Dev Server Not Starting

**Symptoms:**
- `npm run dev` shows errors
- No URL displayed
- Terminal shows error messages

**Solutions:**

1. **Check Node.js is in PATH:**
   ```bash
   node --version
   npm --version
   ```
   If not found, add to PATH (see `ADD_NODEJS_TO_PATH_PERMANENTLY.md`)

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check for port conflicts:**
   - Port 5173 might be in use
   - Vite will auto-use next port (5174, 5175, etc.)
   - Check terminal output for actual port

### Issue 2: Browser Can't Connect

**Symptoms:**
- Dev server starts but browser shows "Can't connect"
- "This site can't be reached"
- Connection refused

**Solutions:**

1. **Check the actual URL:**
   - Look at terminal output after `npm run dev`
   - Should show: `➜  Local:   http://localhost:5173/`
   - Use the EXACT URL shown

2. **Check firewall:**
   - Windows Firewall might be blocking
   - Try: `http://127.0.0.1:5173` instead of `localhost`

3. **Check if server is actually running:**
   ```bash
   # In PowerShell
   Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
   ```
   Should show the port is LISTENING

4. **Try different browser:**
   - Chrome
   - Edge
   - Firefox (for testing, but Web Speech API won't work)

### Issue 3: Page Loads But Shows Errors

**Symptoms:**
- Page opens but blank/white screen
- Console shows errors
- Components don't render

**Solutions:**

1. **Check browser console (F12):**
   - Look for red error messages
   - Common issues:
     - Module not found
     - TypeScript errors
     - Import errors

2. **Check terminal for build errors:**
   - Vite shows errors in terminal
   - Fix any TypeScript/import errors

3. **Clear browser cache:**
   - Hard refresh: `Ctrl + Shift + R`
   - Or clear cache in browser settings

### Issue 4: Backend Connection Fails

**Symptoms:**
- Frontend loads but can't connect to backend
- "Failed to fetch" errors
- CORS errors

**Solutions:**

1. **Check backend is running:**
   ```bash
   python clarte_backend_api.py
   ```
   Should show: `Running on http://0.0.0.0:8000`

2. **Check .env file:**
   - Must exist in root directory
   - Content: `VITE_BACKEND_URL=http://localhost:8000`
   - No spaces around `=`

3. **Check CORS:**
   - Backend should have `CORS(app)` enabled
   - Check `clarte_backend_api.py` line 23

## 🔍 Diagnostic Steps

### Step 1: Verify Setup

```bash
# Check Node.js
node --version
npm --version

# Check files exist
Test-Path "package.json"
Test-Path "src/main.tsx"
Test-Path "index.html"
Test-Path ".env"
```

### Step 2: Start Dev Server

```bash
# Add Node.js to PATH (if needed)
$env:Path += ";C:\Program Files\nodejs\"

# Start dev server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Check Server is Listening

```bash
# Check port is listening
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object LocalPort, State
```

Should show: `LISTENING`

### Step 4: Test Connection

1. **Open browser**
2. **Go to:** `http://localhost:5173`
3. **Open console (F12)**
4. **Check for errors**

## ✅ Quick Fix Checklist

- [ ] Node.js installed and in PATH
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file exists with correct URL
- [ ] Backend is running (`python clarte_backend_api.py`)
- [ ] Dev server started (`npm run dev`)
- [ ] Using correct URL from terminal output
- [ ] Browser console shows no errors
- [ ] Firewall not blocking connection

## 🚀 Test Commands

```bash
# Full test sequence
$env:Path += ";C:\Program Files\nodejs\"
npm run dev
```

Then open: `http://localhost:5173`

If port is different, use the URL shown in terminal!
