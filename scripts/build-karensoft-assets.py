#!/usr/bin/env python3
"""ساخت برش‌های لوگوی کارن‌سافت از فایل اصلی RGBA با Pillow.

Usage: python3 scripts/build-karensoft-assets.py /path/to/logo.png
Source: https://raw.githubusercontent.com/rahmaniho/karen-soft/refs/heads/main/public/images/logo.png
Source Git blob: 7b61880c9715ef15eb0f1eda6dd9ce8c3c924820
اگر فایل اصلی تغییر کرد، با بررسی ردیف‌های شفاف میان اجزا محدوده‌ها را بازبینی کنید.
"""
from pathlib import Path
import sys

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "images" / "karensoft"
# بازه‌ها شامل هر دو ردیف ابتدا و انتها هستند.
RANGES = {"mark": (84, 260), "wordmark-fa": (280, 376), "wordmark-en": (380, 420)}


def alpha_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A").point(lambda value: 255 if value > 8 else 0)
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError("ناحیۀ انتخاب‌شده هیچ پیکسل غیرشفافی ندارد.")
    return bounds


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/build-karensoft-assets.py /path/to/logo.png")
    original = Image.open(sys.argv[1]).convert("RGBA")
    if original.size != (501, 501):
        raise SystemExit("ابعاد لوگوی اصلی تغییر کرده؛ ردیف‌های شفاف و محدوده‌های برش را بازبینی کنید.")

    # اگر ردیف تازه‌ای خارج از محدوده‌ها دیده شود، برش خودکار ممکن است بخشی را حذف کند.
    alpha = original.getchannel("A")
    unexpected = [
        y for y in range(original.height)
        if alpha.crop((0, y, original.width, y + 1)).getextrema()[1] > 8
        and not any(start <= y <= end for start, end in RANGES.values())
    ]
    if unexpected:
        raise SystemExit(f"پیکسل بیرون از محدوده‌های برش در ردیف {unexpected[0]}؛ ردیف‌های شفاف را بازبینی کنید.")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name, (top, bottom) in RANGES.items():
        part = original.crop((0, top, original.width, bottom + 1))
        part = part.crop(alpha_bounds(part))
        if name == "mark":
            side = max(part.size) + 16
            padded = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            padded.alpha_composite(part, ((side - part.width) // 2, (side - part.height) // 2))
            part = padded.resize((256, 256), Image.Resampling.LANCZOS)
        else:
            height = 96 if name == "wordmark-fa" else 48
            width = round(part.width * height / part.height)
            part = part.resize((width, height), Image.Resampling.LANCZOS)
        target = OUTPUT / f"{name}.png"
        part.save(target, optimize=True)
        print(f"{target.relative_to(ROOT)}: {part.width}×{part.height}")


if __name__ == "__main__":
    main()
