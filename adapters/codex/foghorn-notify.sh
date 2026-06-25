#!/usr/bin/env bash
# Foghorn adapter for OpenAI Codex CLI.
#
# Codex invokes a notify program on supported events, passing the event
# payload as a single JSON argument ($1). We blare a random clip when a
# turn completes (type == "agent-turn-complete") and ignore everything else.
#
# Wire it up in ~/.codex/config.toml (root keys must precede any [table]):
#   notify = ["/bin/bash", "/ABSOLUTE/PATH/TO/foghorn/adapters/codex/foghorn-notify.sh"]
#
# Note: Codex has no session-start event, so the "keep screen awake"
# feature is not available here (only sound on turn completion).
set -euo pipefail

payload="${1:-}"
case "$payload" in
  *agent-turn-complete*) : ;;   # play
  *) exit 0 ;;                   # ignore other event types
esac

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec bash "$ROOT/scripts/play-random.sh"
