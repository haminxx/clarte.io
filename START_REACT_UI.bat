@echo off
REM Start React UI Development Server
REM Make sure backend is running first!

echo ====================================================================
echo Starting Clarte React UI
echo ====================================================================
echo.
echo Make sure backend is running: python clarte_backend_api.py
echo.
echo Frontend will start on http://localhost:5173
echo.
echo Press Ctrl+C to stop
echo ====================================================================
echo.

REM Add Node.js to PATH for this session
set "PATH=%PATH%;C:\Program Files\nodejs\"

REM Start dev server
npm run dev

pause
