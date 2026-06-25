---
description: Enable or disable Foghorn keep-screen-awake (caffeinate). Enabled by default.
argument-hint: "[status | on | off | toggle]"
allowed-tools: Bash
---

Run the Foghorn keep-awake control with the user's argument and report its output verbatim:

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/foghorn-caffeine.mjs" $ARGUMENTS
```

Argument meaning:
- (none) or `status` → show whether keep-awake is on or off
- `on` → enable (caffeinate runs at session start)
- `off` → disable (display may sleep normally)
- `toggle` → flip the current setting

Note: changes take effect on the next session start.
