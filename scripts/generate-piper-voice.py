#!/usr/bin/env python3
"""Generate 8 short Vietnamese praise clips with the independently hosted Piper voice.

Runtime: GitHub Actions Ubuntu + piper-tts + ffmpeg. The ONNX model is downloaded
only for the build and is never shipped to a child's browser.
Model and dataset credits: https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/vi/vi_VN/vais1000/medium
Dataset license: Creative Commons Attribution 4.0 (see docs/voice-attribution.md).
"""
from __future__ import annotations
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

from piper import PiperVoice, SynthesisConfig
from imageio_ffmpeg import get_ffmpeg_exe

PHRASES = (
    "Giỏi lắm, con!",
    "Chính xác rồi!",
    "Con làm tốt lắm!",
    "Rất tuyệt vời!",
    "Cố gắng rất tốt!",
    "Hay quá, con ơi!",
    "Hoan hô! Đúng rồi!",
    "Con tiến bộ rồi!",
)
ROOT = Path(__file__).resolve().parent.parent
MODEL = ROOT / ".cache" / "piper-vietnamese" / "vi_VN-vais1000-medium.onnx"
OUT = ROOT / "public" / "audio" / "vi-piper"

def main() -> None:
    if not MODEL.is_file() or MODEL.stat().st_size < 60_000_000:
        raise RuntimeError("Missing/invalid Piper VAIS1000 model. The workflow must download the verified ONNX first.")
    if not MODEL.with_suffix(".onnx.json").is_file():
        raise RuntimeError("Missing Piper model configuration JSON")
    OUT.mkdir(parents=True, exist_ok=True)
    voice = PiperVoice.load(MODEL)
    config = SynthesisConfig(length_scale=1.09, noise_scale=0.55, noise_w_scale=0.75, volume=0.9)
    with tempfile.TemporaryDirectory(prefix="hocvui-piper-") as temp_dir:
        for number, phrase in enumerate(PHRASES, 1):
            wav_path = Path(temp_dir) / f"{number:02d}.wav"
            mp3_path = OUT / f"praise-{number:02d}.mp3"
            with wave.open(str(wav_path), "wb") as wav_file:
                voice.synthesize_wav(phrase, wav_file, syn_config=config)
            with wave.open(str(wav_path), "rb") as audio:
                if audio.getnframes() < audio.getframerate() // 5:
                    raise RuntimeError(f"Generated speech is too short: {number}")
            subprocess.run([
                get_ffmpeg_exe(), "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
                "-i", str(wav_path),
                "-af", "loudnorm=I=-22:TP=-3:LRA=7",
                "-codec:a", "libmp3lame", "-b:a", "64k",
                str(mp3_path)
            ], check=True)
            if not mp3_path.is_file() or mp3_path.stat().st_size < 1500:
                raise RuntimeError(f"Speech clip is missing or too short: {number}")
            with open(mp3_path, "rb") as clip:
                header = clip.read(4)
            if not (header.startswith(b"ID3") or header[0] == 255):
                raise RuntimeError(f"Not an MP3 file: {mp3_path.name}")
            print(f"PASS: generated {mp3_path.name} ({mp3_path.stat().st_size} bytes)", flush=True)
    (OUT / "ATTRIBUTION.txt").write_text(
        "Voice: Piper vi_VN-vais1000-medium (Vietnamese, one speaker).\n"
        "Model source: https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/vi/vi_VN/vais1000/medium\n"
        "Dataset: VAIS-1000 Vietnamese Speech Synthesis Corpus.\n"
        "Dataset license: CC BY 4.0 https://creativecommons.org/licenses/by/4.0/\n"
        "Clips generated for Học Vui. Speech rate and loudness adjusted; source audio not redistributed.\n",
        encoding="utf-8",
    )

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("FAIL: " + str(exc), file=sys.stderr)
        sys.exit(1)
