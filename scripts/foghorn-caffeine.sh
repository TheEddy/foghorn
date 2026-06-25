#!/usr/bin/env bash
# Enable/disable Foghorn's keep-screen-awake (caffeinate). Enabled by default.
# Stored in ~/.config/foghorn/caffeinate (on|off), read by keep-awake.sh
# (Claude Code) and the OpenCode plugin.
#
# Usage:
#   foghorn-caffeine.sh           # show status
#   foghorn-caffeine.sh on        # enable
#   foghorn-caffeine.sh off       # disable
#   foghorn-caffeine.sh toggle    # flip
set -euo pipefail

cfg_dir="${XDG_CONFIG_HOME:-$HOME/.config}/foghorn"
cfg="$cfg_dir/caffeinate"

current() { [ -r "$cfg" ] && tr -d '[:space:]' < "$cfg" || echo "on"; }
set_state() { mkdir -p "$cfg_dir"; printf '%s\n' "$1" > "$cfg"; }

case "${1:-status}" in
  status|get|"")
    echo "Foghorn keep-awake: $(current)"
    ;;
  on|enable)
    set_state on
    echo "Foghorn keep-awake enabled (caffeinate starts at next session)"
    ;;
  off|disable)
    set_state off
    echo "Foghorn keep-awake disabled (takes effect next session; current caffeinate, if any, ends on exit)"
    ;;
  toggle)
    if [ "$(current)" = "off" ]; then set_state on; echo "Foghorn keep-awake enabled"; else set_state off; echo "Foghorn keep-awake disabled"; fi
    ;;
  *)
    echo "usage: foghorn-caffeine.sh [status|on|off|toggle]" >&2
    exit 1
    ;;
esac
