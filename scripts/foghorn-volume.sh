#!/usr/bin/env bash
# Get/set Foghorn playback volume.
# Volume is an afplay gain: 1.0 = normal, 0 = mute, 2.0 = louder.
# Stored in ~/.config/foghorn/volume and read by play-random.sh on every CLI.
#
# Usage:
#   foghorn-volume.sh            # show current volume
#   foghorn-volume.sh get        # show current volume
#   foghorn-volume.sh 0.5        # set volume
#   foghorn-volume.sh test       # play a random clip at the current volume
set -euo pipefail

cfg_dir="${XDG_CONFIG_HOME:-$HOME/.config}/foghorn"
cfg="$cfg_dir/volume"

current() { [ -r "$cfg" ] && tr -d '[:space:]' < "$cfg" || echo "1.0"; }

case "${1:-get}" in
  get|show|"")
    echo "Foghorn volume: $(current)"
    ;;
  test)
    ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    echo "Playing test clip at volume $(current)…"
    bash "$ROOT/scripts/play-random.sh"
    ;;
  *)
    v="$1"
    if ! [[ "$v" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
      echo "error: volume must be a number >= 0 (e.g. 0.5, 1.0, 2.0)" >&2
      exit 1
    fi
    mkdir -p "$cfg_dir"
    printf '%s\n' "$v" > "$cfg"
    echo "Foghorn volume set to $v"
    ;;
esac
