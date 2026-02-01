"""
Python Finder Script - Helps locate Python installations on Windows
"""
import os
import sys
import subprocess
from pathlib import Path

print("=" * 70)
print("Python Finder - Searching for Python installations...")
print("=" * 70)

# Check current Python
print(f"\n✅ Current Python interpreter: {sys.executable}")
print(f"   Version: {sys.version}")
print(f"   Python Path: {sys.path[0]}")

# Common Python installation locations
common_paths = [
    r"C:\Python*",
    r"C:\Program Files\Python*",
    r"C:\Program Files (x86)\Python*",
    os.path.expanduser(r"~\AppData\Local\Programs\Python"),
    os.path.expanduser(r"~\AppData\Local\Microsoft\WindowsApps"),
    r"C:\Users\Public\Python*",
]

print("\n" + "=" * 70)
print("Searching common installation paths...")
print("=" * 70)

found_pythons = []

# Check WindowsApps (Microsoft Store Python)
windowsapps = Path(os.path.expanduser("~")) / "AppData" / "Local" / "Microsoft" / "WindowsApps"
if windowsapps.exists():
    for exe in windowsapps.glob("python*.exe"):
        try:
            result = subprocess.run([str(exe), "--version"], 
                                  capture_output=True, text=True, timeout=2)
            if result.returncode == 0:
                found_pythons.append((str(exe), result.stdout.strip()))
        except:
            pass

# Check Program Files
for base_path in [Path("C:/Program Files"), Path("C:/Program Files (x86)")]:
    if base_path.exists():
        for python_dir in base_path.glob("Python*"):
            python_exe = python_dir / "python.exe"
            if python_exe.exists():
                try:
                    result = subprocess.run([str(python_exe), "--version"], 
                                          capture_output=True, text=True, timeout=2)
                    if result.returncode == 0:
                        found_pythons.append((str(python_exe), result.stdout.strip()))
                except:
                    pass

# Check user AppData
appdata_python = Path(os.path.expanduser("~")) / "AppData" / "Local" / "Programs" / "Python"
if appdata_python.exists():
    for python_dir in appdata_python.iterdir():
        if python_dir.is_dir():
            python_exe = python_dir / "python.exe"
            if python_exe.exists():
                try:
                    result = subprocess.run([str(python_exe), "--version"], 
                                          capture_output=True, text=True, timeout=2)
                    if result.returncode == 0:
                        found_pythons.append((str(python_exe), result.stdout.strip()))
                except:
                    pass

# Display results
if found_pythons:
    print(f"\n✅ Found {len(found_pythons)} Python installation(s):\n")
    for i, (path, version) in enumerate(found_pythons, 1):
        print(f"{i}. {path}")
        print(f"   Version: {version}\n")
else:
    print("\n⚠️  No additional Python installations found in common locations.")
    print("   Python might be installed via Microsoft Store or in a custom location.")

print("=" * 70)
print("\n💡 To use Python in VS Code/Cursor:")
print("   1. Press Ctrl+Shift+P")
print("   2. Type: Python: Select Interpreter")
print("   3. Choose one of the Python paths above")
print("   4. Or browse to find Python if not listed")
print("=" * 70)
