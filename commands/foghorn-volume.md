---
description: Get or set the Foghorn meme-sound volume (1.0 = normal, 0 = mute, 2.0 = louder)
argument-hint: "[number | get | test]"
allowed-tools: Bash
---

Run the Foghorn volume control with the user's argument and report its output verbatim:

```bash
bash "$CLAUDE_PLUGIN_ROOT/scripts/foghorn-volume.sh" $ARGUMENTS
```

Argument meaning:
- (none) or `get` → show the current volume
- a number, e.g. `0.5`, `1.0`, `2.0` → set the volume (afplay gain; 1.0 = normal, 0 = mute)
- `test` → play a random clip at the current volume so the user can hear it
