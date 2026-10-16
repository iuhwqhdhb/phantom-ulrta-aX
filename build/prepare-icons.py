"""Render the supplied Phantom artwork into web and iOS icon sizes."""

import base64
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "assets" / "brand"
WEB = ROOT / "www"


def save_icon(source: Image.Image, filename: str, size: int) -> None:
    destination = WEB / filename
    source.resize((size, size), Image.Resampling.LANCZOS).save(destination, "PNG", optimize=True)
    if filename.startswith("icon-") and filename != "icon-maskable-512.png":
        destination.with_suffix(".b64").write_text(
            base64.b64encode(destination.read_bytes()).decode("ascii"), encoding="ascii"
        )


rounded = Image.open(BRAND / "Phantom-Icon_App_1200x1200.png").convert("RGBA")
square = Image.open(BRAND / "Phantom-Icon_Square_1200x1200.png").convert("RGB")

for size in (180, 192, 512):
    save_icon(rounded, f"icon-{size}.png", size)

save_icon(square, "icon-1024.png", 1024)
save_icon(square, "icon-maskable-512.png", 512)
