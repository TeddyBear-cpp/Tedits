"""Check the loop join and make a small visual contact sheet."""

from __future__ import annotations

import json

import numpy as np
from PIL import Image, ImageDraw

import render


def small_pixels(image: Image.Image) -> np.ndarray:
    return np.asarray(image.resize((320, 180), Image.Resampling.BILINEAR), dtype=np.int16)


def mae(a: Image.Image, b: Image.Image) -> float:
    return float(np.abs(small_pixels(a) - small_pixels(b)).mean())


def main() -> None:
    plate = Image.open(render.ASSETS / "cloud-plate.png").convert("RGB").resize(
        (render.WIDTH, render.HEIGHT), Image.Resampling.LANCZOS
    )
    hands = Image.open(render.ASSETS / "hands-cutout.png").convert("RGBA").resize(
        (render.WIDTH, render.HEIGHT), Image.Resampling.LANCZOS
    )
    sources = (
        plate.resize((render.WIDTH + 56, render.HEIGHT + 32), Image.Resampling.BICUBIC),
        render.make_fog(plate, (210, 225, 237), threshold=105, strength=40, blur=32),
        render.make_fog(plate, (250, 241, 221), threshold=145, strength=30, blur=46),
        *render.split_hands(hands),
    )
    frames = {index: render.render_frame(index, *sources) for index in (0, 1, 48, 96, 144, 191, 192)}
    seam = mae(frames[191], frames[0])
    first_step = mae(frames[0], frames[1])
    checks = {
        "frame_0_equals_frame_at_8_seconds": frames[0].tobytes() == frames[192].tobytes(),
        "frame_1_equals_last_frame": frames[1].tobytes() == frames[191].tobytes(),
        "seam_mae": round(seam, 5),
        "first_step_mae": round(first_step, 5),
        "seam_equals_first_step": abs(seam - first_step) < 1e-9,
        "half_cycle_change_mae": round(mae(frames[0], frames[96]), 5),
    }
    (render.OUTPUT / "seam-check.json").write_text(json.dumps(checks, indent=2), encoding="utf-8")

    sheet = Image.new("RGB", (960, 540), "white")
    draw = ImageDraw.Draw(sheet)
    for number, (index, label) in enumerate(((0, "0s"), (48, "2s"), (96, "4s"), (144, "6s"))):
        thumb = frames[index].resize((480, 270), Image.Resampling.LANCZOS)
        x, y = (number % 2) * 480, (number // 2) * 270
        sheet.paste(thumb, (x, y))
        draw.rectangle((x + 12, y + 12, x + 48, y + 34), fill=(18, 27, 36))
        draw.text((x + 18, y + 16), label, fill="white")
    sheet.save(render.OUTPUT / "contact-sheet.jpg", quality=91)
    print(json.dumps(checks, indent=2))
    if not all(checks[key] for key in (
        "frame_0_equals_frame_at_8_seconds", "frame_1_equals_last_frame", "seam_equals_first_step"
    )):
        raise SystemExit("Loop seam checks failed")


if __name__ == "__main__":
    main()
