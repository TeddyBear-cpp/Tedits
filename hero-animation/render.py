"""Render a deterministic, seamless, eight-second hands-and-clouds hero loop.

Requires Pillow and NumPy. FFmpeg is supplied by the local Node package in
node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe.
"""

from __future__ import annotations

import json
import math
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "output"
FFMPEG = ROOT / "node_modules" / "@ffmpeg-installer" / "win32-x64" / "ffmpeg.exe"
WIDTH, HEIGHT = 1440, 810
FPS, SECONDS = 24, 8
FRAME_COUNT = FPS * SECONDS
TAU = math.tau


def make_fog(base: Image.Image, color: tuple[int, int, int], threshold: int, strength: int, blur: int) -> Image.Image:
    luminance = ImageOps.grayscale(base).filter(ImageFilter.GaussianBlur(blur))
    light = np.asarray(luminance, dtype=np.float32)
    alpha = np.clip((light - threshold) / (255 - threshold), 0, 1) * strength
    xs = np.minimum(np.arange(WIDTH), np.arange(WIDTH)[::-1]) / 110
    ys = np.minimum(np.arange(HEIGHT), np.arange(HEIGHT)[::-1]) / 80
    edge = np.minimum(np.minimum(xs[None, :], ys[:, None]), 1)
    alpha = (alpha * edge).astype(np.uint8)
    fog = Image.new("RGBA", (WIDTH, HEIGHT), color + (0,))
    fog.putalpha(Image.fromarray(alpha, "L"))
    return fog


def split_hands(hands: Image.Image) -> tuple[tuple[Image.Image, tuple[int, int]], tuple[Image.Image, tuple[int, int]]]:
    pixels = np.array(hands, copy=True)
    split = round(983 / 1672 * WIDTH)
    layers = []
    for left in (True, False):
        part = pixels.copy()
        if left:
            part[:, split:, 3] = 0
        else:
            part[:, :split, 3] = 0
        image = Image.fromarray(part, "RGBA")
        bbox = image.getchannel("A").getbbox()
        if not bbox:
            raise RuntimeError("Hand layer has no visible pixels")
        x0 = max(0, bbox[0] - 12)
        y0 = max(0, bbox[1] - 12)
        x1 = min(WIDTH, bbox[2] + 12)
        y1 = min(HEIGHT, bbox[3] + 12)
        layers.append((image.crop((x0, y0, x1, y1)), (x0, y0)))
    return layers[0], layers[1]


def shifted(layer: Image.Image, dx: float, dy: float) -> tuple[Image.Image, int, int]:
    ix, iy = math.floor(dx), math.floor(dy)
    fx, fy = dx - ix, dy - iy
    transformed = layer.transform(
        layer.size,
        Image.Transform.AFFINE,
        (1, 0, -fx, 0, 1, -fy),
        resample=Image.Resampling.BICUBIC,
        fillcolor=(0, 0, 0, 0),
    )
    return transformed, ix, iy


def render_frame(index: int, bg_large: Image.Image, fog_cool: Image.Image, fog_warm: Image.Image,
                 left_hand: tuple[Image.Image, tuple[int, int]],
                 right_hand: tuple[Image.Image, tuple[int, int]]) -> Image.Image:
    phase = TAU * index / FRAME_COUNT
    # All terms are periodic at the exact eight-second boundary.
    drift = (1 - math.cos(phase)) / 2
    second_drift = (1 - math.cos(2 * phase)) / 2
    crop_x = 28 + round(7 * drift)
    crop_y = 16 + round(4 * second_drift)
    frame = bg_large.crop((crop_x, crop_y, crop_x + WIDTH, crop_y + HEIGHT)).convert("RGBA")

    cool_dx = round(17 * drift)
    cool_dy = round(-7 * second_drift)
    warm_dx = round(-12 * second_drift)
    warm_dy = round(6 * drift)
    for fog, dx, dy in ((fog_cool, cool_dx, cool_dy), (fog_warm, warm_dx, warm_dy)):
        haze = Image.new("RGBA", (WIDTH, HEIGHT))
        haze.paste(fog, (dx, dy))
        frame = Image.alpha_composite(frame, haze)

    reach = drift
    for (hand, (x, y)), dx, dy in (
        (left_hand, 3.2 * reach, 1.2 * reach),
        (right_hand, -3.2 * reach, -1.0 * reach),
    ):
        moved, ix, iy = shifted(hand, dx, dy)
        overlay = Image.new("RGBA", (WIDTH, HEIGHT))
        overlay.paste(moved, (x + ix, y + iy))
        frame = Image.alpha_composite(frame, overlay)
    return frame.convert("RGB")


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    if not FFMPEG.is_file():
        raise FileNotFoundError(f"FFmpeg encoder missing: {FFMPEG}")

    plate = Image.open(ASSETS / "cloud-plate.png").convert("RGB").resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    hands = Image.open(ASSETS / "hands-cutout.png").convert("RGBA").resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    bg_large = plate.resize((WIDTH + 56, HEIGHT + 32), Image.Resampling.BICUBIC)
    fog_cool = make_fog(plate, (210, 225, 237), threshold=105, strength=40, blur=32)
    fog_warm = make_fog(plate, (250, 241, 221), threshold=145, strength=30, blur=46)
    left_hand, right_hand = split_hands(hands)

    mp4 = OUTPUT / "reaching-hands-loop.mp4"
    command = [
        str(FFMPEG), "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{WIDTH}x{HEIGHT}",
        "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "medium",
        "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(mp4),
    ]
    encoder = subprocess.Popen(command, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    first_small = None
    previous_small = None
    frame_differences = []
    try:
        assert encoder.stdin is not None
        for index in range(FRAME_COUNT):
            frame = render_frame(index, bg_large, fog_cool, fog_warm, left_hand, right_hand)
            if index == 0:
                frame.save(OUTPUT / "poster.jpg", quality=93, subsampling=0)
            if index in (0, 48, 96, 144, FRAME_COUNT - 1):
                frame.save(OUTPUT / f"frame-{index:03d}.jpg", quality=90)
            small = np.asarray(frame.resize((320, 180), Image.Resampling.BILINEAR), dtype=np.int16)
            if first_small is None:
                first_small = small
            if previous_small is not None:
                frame_differences.append(float(np.abs(small - previous_small).mean()))
            previous_small = small
            encoder.stdin.write(frame.tobytes())
            if (index + 1) % 48 == 0:
                print(f"Rendered {index + 1}/{FRAME_COUNT} frames", flush=True)
    finally:
        if encoder.stdin:
            encoder.stdin.close()
    stderr = encoder.stderr.read().decode("utf-8", errors="replace") if encoder.stderr else ""
    if encoder.wait() != 0:
        raise RuntimeError(f"FFmpeg encode failed: {stderr}")

    webm = OUTPUT / "reaching-hands-loop.webm"
    webm_command = [
        str(FFMPEG), "-hide_banner", "-loglevel", "error", "-y", "-i", str(mp4),
        "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "32", "-cpu-used", "4",
        "-deadline", "good", "-row-mt", "1", str(webm),
    ]
    subprocess.run(webm_command, check=True)

    exact_start = render_frame(0, bg_large, fog_cool, fog_warm, left_hand, right_hand)
    exact_end = render_frame(FRAME_COUNT, bg_large, fog_cool, fog_warm, left_hand, right_hand)
    exact_boundary_equal = exact_start.tobytes() == exact_end.tobytes()
    assert first_small is not None and previous_small is not None
    seam_mae = float(np.abs(first_small - previous_small).mean())
    typical_mae = float(np.median(frame_differences))
    report = {
        "duration_seconds": SECONDS,
        "fps": FPS,
        "frames": FRAME_COUNT,
        "dimensions": [WIDTH, HEIGHT],
        "frame_0_equals_frame_at_8_seconds": exact_boundary_equal,
        "seam_mean_absolute_error_320x180": round(seam_mae, 4),
        "median_adjacent_frame_error_320x180": round(typical_mae, 4),
        "seam_to_typical_ratio": round(seam_mae / typical_mae, 4) if typical_mae else None,
    }
    (OUTPUT / "loop-check.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2), flush=True)


if __name__ == "__main__":
    main()
