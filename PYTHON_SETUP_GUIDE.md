# Python Interpreter Setup Guide

## 🎯 Quick Setup Steps

### Step 1: Select Python Interpreter in Your IDE

**In VS Code/Cursor:**

1. **Open Command Palette:**
   - Press `Ctrl + Shift + P` (Windows/Linux)
   - Or `Cmd + Shift + P` (Mac)

2. **Select Python Interpreter:**
   - Type: `Python: Select Interpreter`
   - Press Enter

3. **Choose Python Version:**
   - You'll see a list of available Python interpreters
   - Select the latest Python 3.x version (e.g., Python 3.11, 3.12)
   - If you see multiple, choose the one that says "Recommended" or the highest version number

4. **Verify Selection:**
   - Look at the bottom-right corner of your IDE
   - You should see the Python version displayed (e.g., "Python 3.12.0")
   - Click it to change if needed

### Step 2: If No Python Appears in the List

**Option A: Install Python (Recommended)**

1. Download Python from: https://www.python.org/downloads/
2. **IMPORTANT:** During installation, check ✅ "Add Python to PATH"
3. Click "Install Now"
4. After installation, restart your IDE
5. Try Step 1 again

**Option B: Browse for Python**

1. In the interpreter selection menu, click "Enter interpreter path..."
2. Browse to one of these common locations:
   - `C:\Python3x\python.exe`
   - `C:\Users\YourName\AppData\Local\Programs\Python\Python3x\python.exe`
   - `C:\Program Files\Python3x\python.exe`
3. Select `python.exe`

### Step 3: Verify Python Works

Open a terminal in your IDE (`` Ctrl + ` ``) and run:

```bash
python --version
```

You should see: `Python 3.x.x`

### Step 4: Install Required Packages

```bash
pip install google-generativeai anthropic requests
```

## 🔍 Troubleshooting

### Problem: "Python is not recognized"

**Solution:** Python is not in your system PATH.

1. Find where Python is installed (check `C:\Python*` or `C:\Users\YourName\AppData\Local\Programs\Python`)
2. Add it to PATH:
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to **Advanced** tab → **Environment Variables**
   - Under **System Variables**, find **Path** → Click **Edit**
   - Click **New** → Add Python folder (e.g., `C:\Python312`)
   - Click **New** → Add Scripts folder (e.g., `C:\Python312\Scripts`)
   - Click **OK** on all dialogs
   - Restart your IDE

### Problem: "No Python interpreters found"

**Solution:** Python might not be installed.

1. Install Python from https://www.python.org/downloads/
2. Make sure to check "Add Python to PATH" during installation
3. Restart your IDE

### Problem: Wrong Python version selected

**Solution:** Select a different interpreter.

1. Click the Python version in bottom-right corner
2. Or press `Ctrl + Shift + P` → `Python: Select Interpreter`
3. Choose a different version

## ✅ Verification Checklist

- [ ] Python interpreter selected in IDE
- [ ] Python version shows in bottom-right corner
- [ ] `python --version` works in terminal
- [ ] `pip --version` works in terminal
- [ ] Required packages installed (`google-generativeai`, `anthropic`, `requests`)

## 🚀 After Setup

Once Python is configured:

1. Open `clarte_claude_nlp.py`
2. The "Select Interpreter" warning should disappear
3. You can now run the script!

## 📝 Quick Reference

- **Select Interpreter:** `Ctrl + Shift + P` → `Python: Select Interpreter`
- **Open Terminal:** `` Ctrl + ` ``
- **Check Python:** `python --version`
- **Install Package:** `pip install package_name`
