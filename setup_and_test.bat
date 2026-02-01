@echo off
echo ====================================================================
echo Clarte Pipeline Setup and Test Script
echo ====================================================================
echo.

echo Step 1: Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in PATH!
    echo.
    echo Please:
    echo 1. Install Python from https://www.python.org/downloads/
    echo 2. Make sure to check "Add Python to PATH" during installation
    echo 3. Restart this terminal and run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Python is installed
python --version
echo.

echo Step 2: Checking pip...
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] pip is not found!
    pause
    exit /b 1
)

echo [OK] pip is available
pip --version
echo.

echo Step 3: Installing required packages...
echo Installing google-generativeai...
pip install google-generativeai --quiet
if %errorlevel% neq 0 (
    echo [WARN] Failed to install google-generativeai
) else (
    echo [OK] google-generativeai installed
)

echo Installing anthropic...
pip install anthropic --quiet
if %errorlevel% neq 0 (
    echo [WARN] Failed to install anthropic
) else (
    echo [OK] anthropic installed
)

echo Installing requests...
pip install requests --quiet
if %errorlevel% neq 0 (
    echo [WARN] Failed to install requests
) else (
    echo [OK] requests installed
)

echo.
echo ====================================================================
echo Setup Complete!
echo ====================================================================
echo.
echo Testing Gemini API integration...
python test_gemini_integration.py
echo.
echo ====================================================================
echo Ready to run Clarte!
echo ====================================================================
echo.
echo To start Clarte, run:
echo   python clarte_claude_nlp.py
echo.
pause
