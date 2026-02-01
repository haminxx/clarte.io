# check_nodejs.ps1
# Check if Node.js is installed and accessible

Write-Host "=" -NoNewline
Write-Host ("=" * 69)
Write-Host "Node.js Installation Check"
Write-Host "=" -NoNewline
Write-Host ("=" * 69)
Write-Host ""

# Check if node is in PATH
Write-Host "Checking if 'node' command is available..."
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js not found in PATH" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Node.js not found in PATH" -ForegroundColor Red
}

Write-Host ""

# Check if npm is in PATH
Write-Host "Checking if 'npm' command is available..."
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm not found in PATH" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ npm not found in PATH" -ForegroundColor Red
}

Write-Host ""

# Check common installation locations
Write-Host "Checking common installation locations..."
$commonPaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:ProgramFiles\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

$found = $false
foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Found Node.js at: $path" -ForegroundColor Green
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "❌ Node.js not found in common locations" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" -NoNewline
Write-Host ("=" * 69)

# Check if package.json exists
Write-Host ""
Write-Host "Checking for package.json..."
if (Test-Path "package.json") {
    Write-Host "✅ package.json found" -ForegroundColor Green
    Write-Host ""
    Write-Host "If Node.js is installed, you can run:" -ForegroundColor Cyan
    Write-Host "  npm install" -ForegroundColor White
} else {
    Write-Host "⚠️  package.json not found in current directory" -ForegroundColor Yellow
    Write-Host "   Make sure you're in the project root directory" -ForegroundColor Yellow
}

Write-Host ""
