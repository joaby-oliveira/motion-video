"""Apply the two compatibility fixes motion-video needs in a freecut checkout.

Idempotent: running it again on an already patched checkout changes nothing.

Usage: python patch_freecut.py [path/to/freecut]   (default: ~/Developer/freecut)
"""

from __future__ import annotations

import sys
from pathlib import Path

TRANSCRIBE_OLD = """        wm = WhisperModel(model, device="auto", compute_type="auto")
        segments, _info = wm.transcribe(
            str(audio_path),"""

TRANSCRIBE_NEW = """        import librosa
        wm = WhisperModel(model, device="auto", compute_type="auto")
        # Decode the ffmpeg-extracted WAV ourselves: faster-whisper's own
        # decoder passes metadata_errors= to av.open(), which PyAV >= 15 rejects.
        audio, _sr = librosa.load(str(audio_path), sr=16000, mono=True)
        segments, _info = wm.transcribe(
            audio,"""

RENDER_OLD = """        subs_abs = str(subtitles_path.resolve()).replace(":", r"\\:")"""

RENDER_NEW = """        # as_posix: Windows backslashes are escape chars inside ffmpeg filter args.
        subs_abs = subtitles_path.resolve().as_posix().replace(":", r"\\:")"""


def patch(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text(encoding="utf-8")
    if new in text:
        print(f"  ok       {label} (already patched)")
    elif old in text:
        path.write_text(text.replace(old, new, 1), encoding="utf-8")
        print(f"  patched  {label}")
    else:
        print(f"  skipped  {label} (code changed upstream; check it manually)")


def main() -> None:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Developer" / "freecut"
    helpers = root / "helpers"
    if not helpers.is_dir():
        sys.exit(f"freecut not found at {root}")
    patch(helpers / "transcribe.py", TRANSCRIBE_OLD, TRANSCRIBE_NEW, "transcribe.py: decode audio with librosa")
    patch(helpers / "render.py", RENDER_OLD, RENDER_NEW, "render.py: posix subtitle path")


if __name__ == "__main__":
    main()
