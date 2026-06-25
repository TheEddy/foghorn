#!/bin/bash
# Keeps the macOS display awake for the session via caffeinate, unless disabled.
# Enabled by default; toggle with scripts/foghorn-caffeine.sh (on|off).
#
# $1 = pid to tie caffeinate's lifetime to (the agent process). The caller must
# expand $PPID in the hook shell and pass it here, because $PPID inside this
# script would be the transient hook shell, not the long-lived agent.
cfg="${XDG_CONFIG_HOME:-$HOME/.config}/foghorn/caffeinate"
state="on"
[ -r "$cfg" ] && state="$(tr -d '[:space:]' < "$cfg")"
[ "$state" = "off" ] && exit 0

pid="${1:-$PPID}"
nohup caffeinate -d -w "$pid" >/dev/null 2>&1 &
exit 0
