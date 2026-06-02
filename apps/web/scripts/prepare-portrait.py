"""Prepare portfolio headshot: crop, grade, vignette onto brand background."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

SRC = Path(r"C:\Users\rober\OneDrive - Humanberto\Humanberto\CoolFallPic.jpg")
OUT_DIR = Path(__file__).resolve().parents[1] / "public"
SIZE = 960

# Brand tones
INK = (11, 6, 16)
SURFACE = (20, 10, 36)
PURPLE = (42, 14, 69)
GOLD = (201, 162, 39)


def radial_mask(size: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((-size * 0.08, -size * 0.08, size * 1.08, size * 1.08), fill=255)
    return mask.filter(ImageFilter.GaussianBlur(radius=size * 0.06))


def brand_background(size: int) -> Image.Image:
    bg = Image.new("RGB", (size, size), INK)
    draw = ImageDraw.Draw(bg)
    for i in range(size):
        t = i / size
        r = int(INK[0] * (1 - t) + SURFACE[0] * t * 0.6 + PURPLE[0] * t * 0.4)
        g = int(INK[1] * (1 - t) + SURFACE[1] * t * 0.6 + PURPLE[1] * t * 0.4)
        b = int(INK[2] * (1 - t) + SURFACE[2] * t * 0.6 + PURPLE[2] * t * 0.4)
        draw.line([(0, i), (size, i)], fill=(r, g, b))
    gold = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(gold)
    gdraw.ellipse(
        (size * 0.05, size * 0.55, size * 0.95, size * 1.15),
        fill=(*GOLD, 28),
    )
    return Image.alpha_composite(bg.convert("RGBA"), gold).convert("RGB")


def main() -> None:
    img = Image.open(SRC).convert("RGB")
    w, h = img.size

    # Tight portrait crop: head + shoulders, de-emphasize wall/poster.
    left = int(w * 0.08)
    right = int(w * 0.92)
    top = int(h * 0.02)
    bottom = int(h * 0.72)
    cropped = img.crop((left, top, right, bottom))

    # Square crop centered on face.
    cw, ch = cropped.size
    side = min(cw, ch)
    cx = int(cw * 0.52)
    cy = int(ch * 0.42)
    box = (
        max(0, cx - side // 2),
        max(0, cy - side // 2),
        min(cw, cx - side // 2 + side),
        min(ch, cy - side // 2 + side),
    )
    portrait = cropped.crop(box)
    portrait = ImageOps.fit(portrait, (SIZE, SIZE), method=Image.Resampling.LANCZOS)

    # Soft background blur layer for depth.
    blurred = portrait.filter(ImageFilter.GaussianBlur(radius=14))
    mask = radial_mask(SIZE)
    softened = Image.composite(portrait, blurred, mask)

    # Warm grade + slight contrast.
    softened = ImageEnhance.Color(softened).enhance(0.92)
    softened = ImageEnhance.Contrast(softened).enhance(1.06)
    softened = ImageEnhance.Brightness(softened).enhance(0.98)

    # Composite onto brand background with soft edge.
    bg = brand_background(SIZE)
    edge = mask.filter(ImageFilter.GaussianBlur(radius=SIZE * 0.04))
    final = Image.composite(softened, bg, edge)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    jpg = OUT_DIR / "roberto.jpg"
    webp = OUT_DIR / "roberto.webp"
    final.save(jpg, "JPEG", quality=88, optimize=True, progressive=True)
    final.save(webp, "WEBP", quality=86, method=6)
    print(f"Wrote {jpg} ({jpg.stat().st_size // 1024} KB)")
    print(f"Wrote {webp} ({webp.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
