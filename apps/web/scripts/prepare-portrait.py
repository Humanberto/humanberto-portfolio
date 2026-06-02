"""Prepare portfolio headshot: fix EXIF rotation, wider crop, soft brand vignette."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

SRC = Path(r"C:\Users\rober\OneDrive - Humanberto\Humanberto\CoolFallPic.jpg")
OUT_DIR = Path(__file__).resolve().parents[1] / "public"
SIZE = 1024

INK = (11, 6, 16)
PURPLE = (42, 14, 69)


def soft_vignette(size: int) -> Image.Image:
    """Darken only the outer ring — keeps the subject natural."""
    mask = Image.new("L", (size, size), 255)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((-size * 0.02, -size * 0.02, size * 1.02, size * 1.02), fill=255)
    draw.ellipse(
        (size * 0.06, size * 0.06, size * 0.94, size * 0.94),
        fill=int(255 * 0.88),
    )
    return mask.filter(ImageFilter.GaussianBlur(radius=size * 0.09))


def brand_backdrop(size: int) -> Image.Image:
    bg = Image.new("RGB", (size, size), INK)
    draw = ImageDraw.Draw(bg)
    for y in range(size):
        t = y / size
        color = (
            int(INK[0] + (PURPLE[0] - INK[0]) * t * 0.55),
            int(INK[1] + (PURPLE[1] - INK[1]) * t * 0.55),
            int(INK[2] + (PURPLE[2] - INK[2]) * t * 0.55),
        )
        draw.line([(0, y), (size, y)], fill=color)
    return bg


def main() -> None:
    # CRITICAL: phone photos often store rotation in EXIF (this file is orientation 8).
    img = ImageOps.exif_transpose(Image.open(SRC)).convert("RGB")
    w, h = img.size

    # Wider, upright portrait: full hat, shoulders, upper jacket — not chin-to-forehead tight.
    side = int(w * 0.94)
    top = int(h * 0.045)
    left = (w - side) // 2
    portrait = img.crop((left, top, left + side, top + side))
    portrait = ImageOps.fit(portrait, (SIZE, SIZE), method=Image.Resampling.LANCZOS)

    # Blur only the background clutter; keep the face/jacket sharp in the center.
    blurred = portrait.filter(ImageFilter.GaussianBlur(radius=10))
    focus = Image.new("L", (SIZE, SIZE), 0)
    fdraw = ImageDraw.Draw(focus)
    fdraw.ellipse((SIZE * 0.08, SIZE * 0.06, SIZE * 0.92, SIZE * 0.94), fill=255)
    focus = focus.filter(ImageFilter.GaussianBlur(radius=SIZE * 0.07))
    portrait = Image.composite(portrait, blurred, focus)

    # Gentle grade.
    portrait = ImageEnhance.Color(portrait).enhance(0.96)
    portrait = ImageEnhance.Contrast(portrait).enhance(1.03)

    # Soft brand vignette on the edges only.
    bg = brand_backdrop(SIZE)
    vignette = soft_vignette(SIZE)
    final = Image.composite(portrait, bg, vignette)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    jpg = OUT_DIR / "roberto.jpg"
    webp = OUT_DIR / "roberto.webp"
    # Save without EXIF so browsers never re-rotate.
    final.save(jpg, "JPEG", quality=90, optimize=True, progressive=True, exif=b"")
    final.save(webp, "WEBP", quality=88, method=6)
    print(f"Wrote {jpg} ({jpg.stat().st_size // 1024} KB)")
    print(f"Wrote {webp} ({webp.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
