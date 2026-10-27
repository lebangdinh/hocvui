#!/usr/bin/env python3
"""Generate 8 gentle praise clips with Piper speaker 4, Yến Nhi, female South Vietnamese.

Runtime: GitHub Actions Ubuntu + piper-tts + ffmpeg. The ONNX model is downloaded
only for the build and is never shipped to a child's browser.
Model and licensing: https://huggingface.co/CakeByVPBank/piper-pgl-v4-vi_VN-version39_epoch39
Model license: MIT; speech generated with the explicit femalesouth-01 speaker (ID 4).
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
MODEL = ROOT / ".cache" / "piper-vietnamese" / "vi_VN-csa-voice-piper-v3-medium.onnx"
OUT = ROOT / "public" / "audio" / "vi-south"

def main() -> None:
    if not MODEL.is_file() or MODEL.stat().st_size < 70_000_000:
        raise RuntimeError("Missing/invalid Piper southern multi-speaker model.")
    if not MODEL.with_suffix(".onnx.json").is_file():
        raise RuntimeError("Missing Piper model configuration JSON")
    OUT.mkdir(parents=True, exist_ok=True)
    voice = PiperVoice.load(MODEL)
    if voice.config.num_speakers != 5:
        raise RuntimeError(f"Expected five speakers, got {voice.config.num_speakers}")
    # 4 is Yến Nhi (femalesouth-01), not default speaker 0 (female North).
    config = SynthesisConfig(speaker_id=4, length_scale=1.06, noise_scale=0.62, noise_w_scale=0.8, volume=0.85)
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
        "Voice: Yến Nhi (femalesouth-01, speaker ID 4), South Vietnamese female.\n"
        "Model source: https://huggingface.co/CakeByVPBank/piper-pgl-v4-vi_VN-version39_epoch39\n"
        "Model: Piper v3 five-speaker Vietnamese ONNX, generated synthetic training utterances.\n"
        "Model license: MIT https://opensource.org/licenses/MIT\n"
        "Clips generated for Học Vui. Speech rate and loudness adjusted; source audio not redistributed.\n",
        encoding="utf-8",
    )

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("FAIL: " + str(exc), file=sys.stderr)
        sys.exit(1)
