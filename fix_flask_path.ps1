# fix_flask_path.ps1
# Fix Flask PATH warning by adding Python Scripts to PATH

Write-Host "=" -NoNewline
Write-Host ("=" * 69)
Write-Host "Fixing Flask PATH Warning"
Write-Host "=" -NoNewline
Write-Host ("=" * 69)
Write-Host ""

# Get Python Scripts directory
$pythonScriptsPath = "$env:LOCALAPPDATA\Packages\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\LocalCache\local-packages\Python313\Scripts"

Write-Host "Python Scripts Path: $pythonScriptsPath"
Write-Host ""

# Check if directory exists
if (Test-Path $pythonScriptsPath) {
    Write-Host "✅ Scripts directory found"
    
    # Check if flask.exe exists
    $flaskPath = Join-Path $pythonScriptsPath "flask.exe"
    if (Test-Path $flaskPath) {
        Write-Host "✅ Flask.exe found"
    } else {
        Write-Host "⚠️  Flask.exe not found (may need to install flask)"
    }
    
    Write-Host ""
    Write-Host "To add to PATH permanently:"
    Write-Host "1. Press Win + R, type: sysdm.cpl"
    Write-Host "2. Go to Advanced tab → Environment Variables"
    Write-Host "3. Under User variables, find Path → Edit"
    Write-Host "4. Click New → Add this path:"
    Write-Host "   $pythonScriptsPath"
    Write-Host ""
    Write-Host "Or use flask with python -m flask instead:"
    Write-Host "   python -m flask run"
    Write-Host ""
} else {
    Write-Host "⚠️  Scripts directory not found at expected location"
    Write-Host "   This is okay - you can use 'python -m flask' instead"
    Write-Host ""
}

Write-Host "=" -NoNewline
Write-Host ("=" * 69)
