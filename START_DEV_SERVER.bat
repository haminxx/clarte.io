@echo off
REM Start React Dev Server with proper PATH setup

echo ====================================================================
echo Starting Clarte React UI Dev Server
echo ====================================================================
echo.

REM Add Node.js to PATH
set "PATH=%PATH%;C:\Program Files\nodejs\"

REM Check if .env exists, create if not
if not exist ".env" (
    echo Creating .env file...
    echo VITE_BACKEND_URL=http://localhost:8000 > .env
    echo .env file created!
    echo.
)

echo Checking setup...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found in PATH!
    echo Please add C:\Program Files\nodejs\ to your PATH
    echo See: ADD_NODEJS_TO_PATH_PERMANENTLY.md
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Starting dev server...
echo.
echo ====================================================================
echo IMPORTANT: Look for the URL in the output below!
echo It will show: Local: http://localhost:5173/
echo ====================================================================
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
