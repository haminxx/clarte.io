# Debug Black Screen Issue

## Quick Checks

### 1. Check Browser Console (F12)
Open browser DevTools (F12) → Console tab

**Look for:**
- Red error messages
- Failed imports
- Component errors
- Network errors

### 2. Check Terminal (Frontend)
Look at the terminal running `npm run dev`

**Should see:**
- No red errors
- "ready in xxx ms"
- No compilation errors

### 3. Check Network Tab
Browser DevTools → Network tab → Refresh page

**Check:**
- All files loading (200 status)
- No 404 errors
- main.tsx loads
- index.css loads

### 4. Common Issues

**Issue: Import Error**
- Check if all imports are correct
- Verify node_modules installed

**Issue: Component Error**
- Check ClarteVoiceApp.tsx for errors
- Check ai-voice-input.tsx for errors

**Issue: CSS Not Loading**
- Check Tailwind is compiling
- Check index.css imports

**Issue: HTTPS Certificate**
- Accept the certificate warning
- Use https://localhost:5173

## Quick Fixes

### Fix 1: Clear Browser Cache
- Hard refresh: Ctrl + Shift + R
- Or clear cache in browser settings

### Fix 2: Restart Dev Server
```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

### Fix 3: Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Fix 4: Check for JavaScript Errors
Open console (F12) and look for:
- "Cannot read property..."
- "is not a function"
- "Module not found"
- Any red errors

## What to Share

If still not working, share:
1. Browser console errors (F12 → Console)
2. Terminal output from `npm run dev`
3. Network tab errors (F12 → Network)
