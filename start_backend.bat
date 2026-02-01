@echo off
REM Start Clarte Backend API Server
REM This script starts the backend for browser testing

echo ====================================================================
echo Clarte Backend API Server
echo ====================================================================
echo.
echo Starting server on http://localhost:8000
echo.
echo Web interface: Open clarte_web_voice.html in your browser
echo.
echo Press Ctrl+C to stop the server
echo ====================================================================
echo.

python clarte_backend_api.py

pause
