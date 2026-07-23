#!/usr/bin/env python3
"""Generate a QR code image for a URL.

Usage:
  python generate_qr.py "https://example.com/page1.html" qr_page1.png
"""

import sys
from pathlib import Path

try:
    import qrcode
except ImportError:
    print("请先安装依赖: pip install qrcode[pil]")
    raise


def generate_qr(url: str, output_file: Path) -> None:
    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_file)
    print(f"生成二维码: {output_file} -> {url}")


def main() -> None:
    if len(sys.argv) < 2:
        print("用法: python generate_qr.py <url> [output_file]")
        sys.exit(1)

    url = sys.argv[1]
    output = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("img/二维码/qr_page1.png")
    generate_qr(url, output)


if __name__ == "__main__":
    main()
