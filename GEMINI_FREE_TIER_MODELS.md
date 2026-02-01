# Gemini Free Tier Models - Updated

## ✅ Correct Free Tier Models (2024)

The free tier Gemini API supports these models:

1. **gemini-2.5-flash-lite** - Lightest, fastest model
2. **gemini-2.5-flash** - Fast model
3. **gemini-2.0-flash** - Flash 2.0 version
4. **gemini-2.5-pro** - Higher quality model

## 🎯 Model Selection

### Automatic Selection

**Speed preference** → Uses `gemini-2.5-flash-lite` (fastest)
**Quality preference** → Uses `gemini-2.5-pro` (highest quality)

### Manual Selection

You can specify which model to use:

- **"use flash_lite"** → `gemini-2.5-flash-lite`
- **"use flash"** → `gemini-2.5-flash`
- **"use flash 2.0"** → `gemini-2.0-flash`
- **"use pro"** → `gemini-2.5-pro`

## 📊 Code Structure

```python
FREE_TIER_GEMINI_MODELS = {
    "flash_lite": "gemini-2.5-flash-lite",  # Lightest, fastest
    "flash": "gemini-2.5-flash",            # Fast
    "flash_2": "gemini-2.0-flash",          # Flash 2.0
    "pro": "gemini-2.5-pro",                # Higher quality
}
```

## 🚀 Usage Examples

### Automatic (Speed)
```
You: Quick question: what is anxiety?
→ Uses gemini-2.5-flash-lite
```

### Automatic (Quality)
```
You: Explain deeply how anxiety affects the brain
→ Uses gemini-2.5-pro
```

### Manual Selection
```
You: Use flash_lite model: what is depression?
→ Uses gemini-2.5-flash-lite explicitly

You: Use pro model: explain anxiety
→ Uses gemini-2.5-pro explicitly
```

## ⚠️ Free Tier Limits

- **5 requests per minute**
- **25 requests per day**

If exceeded, system automatically falls back to Claude.

## ✅ Updated Files

- ✅ `clarte_claude_nlp.py` - Updated model names
- ✅ `test_gemini_integration.py` - Updated test models
- ✅ Model selection logic updated
- ✅ Startup messages updated

All models are now correctly set to use Gemini 2.5/2.0 versions! 🎉
