#!/usr/bin/env python3
"""Remove background from PNG logos using rembg. Run: pip install rembg pillow && python scripts/remove-logo-bg.py"""
import io
import shutil
from pathlib import Path
try:
    from rembg import remove as rembg_remove
    from PIL import Image
except ImportError:
    print("Install: pip install rembg pillow")
    raise SystemExit(1)
SCRIPT_DIR = Path(__file__).resolve().parent
LOGOS_DIR = SCRIPT_DIR.parent / "public" / "images" / "logos"
BACKUP_DIR = LOGOS_DIR / "backup"
def main():
    if not LOGOS_DIR.is_dir():
        print("Logos dir not found:", LOGOS_DIR)
        raise SystemExit(1)
    pngs = [p for p in LOGOS_DIR.glob("*.png") if p.parent != BACKUP_DIR and not p.name.startswith(".")]
    if not pngs:
        print("No PNGs in", LOGOS_DIR)
        return
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    for path in pngs:
        print("Processing", path.name)
        try:
            if not (BACKUP_DIR / path.name).exists():
                shutil.copy2(path, BACKUP_DIR / path.name)
            with open(path, "rb") as f:
                out_data = rembg_remove(f.read())
            Image.open(io.BytesIO(out_data)).save(path, "PNG")
        except Exception as e:
            print("  ERROR:", e)
    print("Done.")
if __name__ == "__main__":
    main()
