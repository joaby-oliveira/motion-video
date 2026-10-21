#!/usr/bin/env bash
# Installs only what is missing for motion-video (macOS, Linux, Git Bash on Windows).
# Safe to run again: anything already installed is left untouched.
#
#   bash scripts/install.sh                # tools + freecut
#   bash scripts/install.sh --with-skill   # also copies the skill to ~/.claude/skills (no plugin)

set -euo pipefail

WITH_SKILL=0
[ "${1:-}" = "--with-skill" ] && WITH_SKILL=1

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FREECUT="$HOME/Developer/freecut"
SKILLS="$HOME/.claude/skills"
OS="$(uname -s)"
RESTART=0

have() { command -v "$1" >/dev/null 2>&1; }
line() { printf '  %-12s %s\n' "$1" "$2"; }

is_windows() { case "$OS" in MINGW* | MSYS* | CYGWIN*) return 0 ;; *) return 1 ;; esac; }

# $1 brew formula, $2 apt package, $3 winget id
pkg_install() {
	case "$OS" in
	Darwin) brew install "$1" ;;
	Linux) sudo apt-get update -qq && sudo apt-get install -y "$2" ;;
	*)
		winget install -e --id "$3" --accept-source-agreements --accept-package-agreements
		RESTART=1
		;;
	esac
}

echo "motion-video: checking tools"

if have ffmpeg && have ffprobe; then
	line ffmpeg "ok ($(ffmpeg -version | head -1 | awk '{print $3}'))"
else
	line ffmpeg "installing"
	pkg_install ffmpeg ffmpeg Gyan.FFmpeg.Essentials
fi

node_major() { node -v 2>/dev/null | sed 's/^v//' | cut -d. -f1; }
if have node && [ "$(node_major)" -ge 22 ]; then
	line node "ok ($(node -v))"
else
	line node "installing (22+ required)"
	pkg_install node nodejs OpenJS.NodeJS.LTS
fi

if have uv; then
	line uv "ok ($(uv --version | awk '{print $2}'))"
else
	line uv "installing"
	if [ "$OS" = Linux ]; then curl -LsSf https://astral.sh/uv/install.sh | sh; else pkg_install uv uv astral-sh.uv; fi
fi

if have git; then
	line git "ok"
else
	line git "installing"
	pkg_install git git Git.Git
fi

if [ "$RESTART" = 1 ]; then
	echo
	echo "Some tools were installed with winget. Close and reopen the terminal, then run this script again."
	exit 0
fi

# freecut + local Whisper
if [ -d "$FREECUT/.git" ]; then
	line freecut "ok ($FREECUT)"
else
	line freecut "cloning"
	mkdir -p "$(dirname "$FREECUT")"
	git clone -q https://github.com/Moh4696/freecut "$FREECUT"
fi

if [ "$OS" = Darwin ] && [ "$(uname -m)" = arm64 ]; then EXTRA=whisper-mlx; MOD=mlx_whisper; else EXTRA=whisper-fast; MOD=faster_whisper; fi
if is_windows; then PY="$FREECUT/.venv/Scripts/python.exe"; else PY="$FREECUT/.venv/bin/python"; fi

if [ -x "$PY" ] && "$PY" -c "import $MOD, librosa" 2>/dev/null; then
	line whisper "ok ($MOD)"
else
	line whisper "installing ($EXTRA)"
	(cd "$FREECUT" && uv sync -q --extra "$EXTRA")
fi

mkdir -p "$SKILLS"
if [ -e "$SKILLS/freecut/SKILL.md" ]; then
	line skill "freecut ok"
else
	line skill "linking freecut"
	if is_windows; then
		cmd //c mklink /J "$(cygpath -w "$SKILLS/freecut")" "$(cygpath -w "$FREECUT")" >/dev/null
	else
		ln -s "$FREECUT" "$SKILLS/freecut"
	fi
fi

echo "motion-video: freecut compatibility fixes"
"$PY" "$REPO_DIR/scripts/patch_freecut.py" "$FREECUT"

if [ "$WITH_SKILL" = 1 ]; then
	if [ -d "$SKILLS/motion-video" ] && diff -rq "$REPO_DIR/skills/motion-video" "$SKILLS/motion-video" >/dev/null; then
		line skill "motion-video ok"
	else
		[ -d "$SKILLS/motion-video" ] && mv "$SKILLS/motion-video" "$SKILLS/motion-video.bak.$(date +%s)"
		cp -r "$REPO_DIR/skills/motion-video" "$SKILLS/motion-video"
		line skill "motion-video copied"
	fi
fi

echo
echo "Done. Open Claude Code in a folder with your videos and type /motion-video setup to confirm."
