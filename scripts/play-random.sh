#!/bin/bash
# Plays one random meme clip from the plugin's assets/clips on each agent Stop.
# CLAUDE_PLUGIN_ROOT is injected by Claude Code; falls back to script-relative path.
# Volume is read from ~/.config/foghorn/volume (afplay -v gain; 1.0 = normal).
ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
dir="$ROOT/assets/clips"

cfg="${XDG_CONFIG_HOME:-$HOME/.config}/foghorn/volume"
vol="1.0"
if [ -r "$cfg" ]; then
  v="$(tr -d '[:space:]' < "$cfg")"
  [[ "$v" =~ ^[0-9]+(\.[0-9]+)?$ ]] && vol="$v"
fi

shopt -s nullglob
files=("$dir"/*.mp3)
[ ${#files[@]} -eq 0 ] && exit 0
f="${files[RANDOM % ${#files[@]}]}"
nohup afplay -v "$vol" "$f" >/dev/null 2>&1 &
exit 0
