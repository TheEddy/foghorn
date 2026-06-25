#!/bin/bash
# Plays one random meme clip from the plugin's assets/clips on each agent Stop.
# CLAUDE_PLUGIN_ROOT is injected by Claude Code; falls back to script-relative path.
ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
dir="$ROOT/assets/clips"
shopt -s nullglob
files=("$dir"/*.mp3)
[ ${#files[@]} -eq 0 ] && exit 0
f="${files[RANDOM % ${#files[@]}]}"
nohup afplay "$f" >/dev/null 2>&1 &
exit 0
