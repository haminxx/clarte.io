# test_dev_server.ps1
# Diagnostic script to check dev server setup

Write-Host "=" -NoNewline
Write-Host ("=" * 69)
Write-Host "Dev Server Diagnostic"
Write-Host "=" -NoNewline
Write-Host ("=" * 69)
Write-Host ""

# Check Node.js
Write-Host "1. Checking Node.js..."
$env:Path += ";C:\Program Files\nodejs\"
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Node.js not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Node.js not found" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host ""
Write-Host "2. Checking npm..."
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ npm not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check files
Write-Host ""
Write-Host "3. Checking project files..."
$files = @("package.json", "index.html", "src/main.tsx", "src/App.tsx", "vite.config.ts")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file missing" -ForegroundColor Red
    }
}

# Check node_modules
Write-Host ""
Write-Host "4. Checking dependencies..."
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules missing - run: npm install" -ForegroundColor Red
}

# Check .env
Write-Host ""
Write-Host "5. Checking .env file..."
if (Test-Path ".env") {
    Write-Host "   ✅ .env exists" -ForegroundColor Green
    Get-Content ".env" | ForEach-Object { Write-Host "      $_" -ForegroundColor Cyan }
} else {
    Write-Host "   ⚠️  .env missing - create it with: VITE_BACKEND_URL=http://localhost:8000" -ForegroundColor Yellow
}

# Check port
Write-Host ""
Write-Host "6. Checking port 5173..."
$portCheck = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "   ⚠️  Port 5173 is in use" -ForegroundColor Yellow
    Write-Host "      Vite will use next available port" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Port 5173 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "=" -NoNewline
Write-Host ("=" * 69)
Write-Host ""
Write-Host "To start dev server, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open the URL shown in terminal (usually http://localhost:5173)" -ForegroundColor Cyan
Write-Host ""
