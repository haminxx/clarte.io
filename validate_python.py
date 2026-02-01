"""
Python Validator - Checks if Python installations are valid
"""
import sys
import os
import subprocess
from pathlib import Path

print("=" * 70)
print("Python Interpreter Validator")
print("=" * 70)

def test_python(path):
    """Test if a Python path is valid"""
    try:
        # Try to run Python and get version
        result = subprocess.run(
            [path, "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            # Try to import sys to verify it's a real Python
            result2 = subprocess.run(
                [path, "-c", "import sys; print(sys.executable)"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result2.returncode == 0:
                return True, result.stdout.strip()
    except Exception as e:
        pass
    return False, None

# Test current Python
print(f"\n1. Current Python Interpreter:")
print(f"   Path: {sys.executable}")
print(f"   Version: {sys.version}")
is_valid, version = test_python(sys.executable)
if is_valid:
    print(f"   ✅ VALID - {version}")
else:
    print(f"   ❌ INVALID")

# Search for other Python installations
print("\n2. Searching for other Python installations...")
print("=" * 70)

valid_pythons = []

# Check WindowsApps (Microsoft Store)
windowsapps = Path.home() / "AppData/Local/Microsoft/WindowsApps"
if windowsapps.exists():
    for exe in windowsapps.glob("python*.exe"):
        if exe.is_file():
            is_valid, version = test_python(str(exe))
            if is_valid:
                valid_pythons.append((str(exe), version))
                print(f"   ✅ Found: {exe}")
                print(f"      Version: {version}")

# Check Program Files
for base in [Path("C:/Program Files"), Path("C:/Program Files (x86)")]:
    if base.exists():
        for python_dir in base.glob("Python*"):
            python_exe = python_dir / "python.exe"
            if python_exe.exists():
                is_valid, version = test_python(str(python_exe))
                if is_valid:
                    valid_pythons.append((str(python_exe), version))
                    print(f"   ✅ Found: {python_exe}")
                    print(f"      Version: {version}")

# Check user AppData
appdata_python = Path.home() / "AppData/Local/Programs/Python"
if appdata_python.exists():
    for python_dir in appdata_python.iterdir():
        if python_dir.is_dir():
            python_exe = python_dir / "python.exe"
            if python_exe.exists():
                is_valid, version = test_python(str(python_exe))
                if is_valid:
                    valid_pythons.append((str(python_exe), version))
                    print(f"   ✅ Found: {python_exe}")
                    print(f"      Version: {version}")

# Summary
print("\n" + "=" * 70)
print("Summary:")
print("=" * 70)

if valid_pythons:
    print(f"\n✅ Found {len(valid_pythons)} valid Python installation(s):\n")
    for i, (path, version) in enumerate(valid_pythons, 1):
        print(f"{i}. {path}")
        print(f"   {version}\n")
    
    print("=" * 70)
    print("\n💡 To use in VS Code/Cursor:")
    print("   1. Press Ctrl+Shift+P")
    print("   2. Type: Python: Select Interpreter")
    print("   3. Click 'Enter interpreter path...'")
    print(f"   4. Paste one of the paths above")
    print("=" * 70)
else:
    print("\n⚠️  No valid Python installations found!")
    print("\n💡 Install Python:")
    print("   1. Download from: https://www.python.org/downloads/")
    print("   2. During installation, check 'Add Python to PATH'")
    print("   3. Restart your IDE")
    print("=" * 70)
