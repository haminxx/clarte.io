@echo off
REM Quick Status Check - Verify Backend and Frontend

echo ====================================================================
echo Clarte Status Check
echo ====================================================================
echo.

echo Checking Backend (Port 8000)...
powershell -Command "$backend = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue; if ($backend) { Write-Host '  ✅ Backend is RUNNING on port 8000' -ForegroundColor Green } else { Write-Host '  ❌ Backend is NOT running' -ForegroundColor Red }"

echo.
echo Checking Frontend (Port 5173)...
powershell -Command "$frontend = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue; if ($frontend) { Write-Host '  ✅ Frontend is RUNNING on port 5173' -ForegroundColor Green } else { Write-Host '  ❌ Frontend is NOT running' -ForegroundColor Red }"

echo.
echo ====================================================================
echo.
echo To start:
echo   Backend:  python clarte_backend_api.py
echo   Frontend: npm run dev
echo.
echo To test backend health:
echo   Open: http://localhost:8000/health
echo.
echo To open frontend:
echo   Open: http://localhost:5173
echo.
echo ====================================================================
pause
