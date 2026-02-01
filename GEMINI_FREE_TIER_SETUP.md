# Gemini Free Tier Setup - Complete Guide

## ✅ What Was Changed

### 1. Updated Model Names to Free Tier Compatible Models

**Before:**
- `gemini-2.0-flash-exp` (experimental, not available for free tier)
- `gemini-1.5-pro` (correct)

**After:**
- `gemini-1.5-flash` (default for speed - free tier)
- `gemini-1.5-pro` (default for quality - free tier)
- `gemini-1.5-flash-latest` (latest Flash version)
- `gemini-1.5-pro-latest` (latest Pro version)

### 2. Added Model Selection System

The system now supports choosing between different free tier Gemini models:

```python
FREE_TIER_GEMINI_MODELS = {
    "flash": "gemini-1.5-flash",           # Fastest, most available
    "pro": "gemini-1.5-pro",               # Higher quality
    "pro_latest": "gemini-1.5-pro-latest", # Latest Pro
    "flash_latest": "gemini-1.5-flash-latest", # Latest Flash
}
```

### 3. Automatic Model Selection

The system automatically chooses models based on:
- **Speed preference** → `gemini-1.5-flash`
- **Quality preference** → `gemini-1.5-pro`
- **User input keywords** → Can specify model explicitly

## 🎯 How It Works

### Automatic Selection

The system decides which model to use based on your input:

**Speed keywords** (uses Flash):
- "quick", "fast", "simple", "brief"
- Example: "Quick question: what is anxiety?" → Uses `gemini-1.5-flash`

**Quality keywords** (uses Pro):
- "explain", "detailed", "comprehensive", "deep"
- Example: "Explain deeply how anxiety affects the brain" → Uses `gemini-1.5-pro`

### Manual Model Selection

You can also specify which model to use in your input:

**Examples:**
- "Use flash model: what is depression?" → Uses `gemini-1.5-flash`
- "Use pro model: explain anxiety" → Uses `gemini-1.5-pro`
- "Use flash_latest: quick question" → Uses `gemini-1.5-flash-latest`
- "Use pro_latest: detailed explanation" → Uses `gemini-1.5-pro-latest`

## 📊 Free Tier Limits

**Important:** Free tier has strict limits:
- **5 requests per minute**
- **25 requests per day**

If you exceed these limits:
- You'll get a 429 error (rate limit)
- Wait a few minutes before trying again
- The system will automatically fall back to Claude

## 🚀 Testing

### Test 1: Basic Test
```bash
python test_gemini_integration.py
```

This will test all free tier models and show which ones work.

### Test 2: Run Clarte
```bash
python clarte_claude_nlp.py
```

### Test 3: Try Different Models

**Speed test (Flash):**
```
You: Quick question: what is anxiety?
```
Expected: Uses `gemini-1.5-flash`

**Quality test (Pro):**
```
You: Explain deeply how anxiety affects the brain
```
Expected: Uses `gemini-1.5-pro`

**Manual selection:**
```
You: Use flash model: what is depression?
```
Expected: Uses `gemini-1.5-flash` explicitly

## 🔧 Code Structure

### Model Dictionary
Located at line 301 in `clarte_claude_nlp.py`:
```python
FREE_TIER_GEMINI_MODELS = {
    "flash": "gemini-1.5-flash",
    "pro": "gemini-1.5-pro",
    "pro_latest": "gemini-1.5-pro-latest",
    "flash_latest": "gemini-1.5-flash-latest",
}
```

### Model Selection Function
`get_gemini_model_choice()` - Detects model preference from user input

### API Call Function
`call_gemini_api()` - Uses free tier compatible models

## ⚠️ Troubleshooting

### Problem: "Model not found" or 404 error
**Solution:** The model name might not be available. Try:
- `gemini-1.5-flash` (most reliable)
- `gemini-1.5-pro` (if Flash doesn't work)

### Problem: "Quota exceeded" or 429 error
**Solution:** 
- You've hit the free tier limit (5/min, 25/day)
- Wait a few minutes
- System will automatically use Claude as fallback

### Problem: "Invalid API key" or 403 error
**Solution:**
- Check your API key at: https://aistudio.google.com/app/apikey
- Make sure it's a free tier key
- Verify account is verified

### Problem: All models fail
**Solution:**
- Check internet connection
- Verify API key is correct
- Check if account is verified
- Try again in a few minutes

## 📝 Summary

✅ **Updated to free tier models**
✅ **Added model selection system**
✅ **Automatic fallback to Claude**
✅ **Support for 4 free tier models**
✅ **Updated test script**

Your API key (`AIzaSyBeQqsXwifXIWBhfXwItjf1kjt3qyUJOfc`) is configured and ready to use with free tier models!

## 🎯 Next Steps

1. **Test the integration:**
   ```bash
   python test_gemini_integration.py
   ```

2. **Run Clarte:**
   ```bash
   python clarte_claude_nlp.py
   ```

3. **Try different models:**
   - Use speed keywords for Flash
   - Use quality keywords for Pro
   - Or specify model explicitly

The system is now fully configured for free tier Gemini API! 🚀
