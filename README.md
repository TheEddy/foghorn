# 📢 Foghorn

A coding-agent plugin (macOS) that:

- **Blares a random meme sound** when the agent finishes a turn — 40 clips from a soundboard.
- **Keeps the display awake** while a session runs (`caffeinate -d`, tied to the agent process so it auto-stops on exit).

Business in front, FAAAHHH in back.

> macOS only — uses `afplay` and `caffeinate`.

## Compatibility

Foghorn is a **side-effect** plugin (it plays a sound / holds a power assertion), so it only
works on CLIs that can run a shell command on a lifecycle event. Pure rules/instruction-only
agents (Cursor, Windsurf, Cline, Copilot, Gemini) have no way to fire a sound and are not supported.

| CLI             | Sound on finish                   | Keep screen awake             |
| --------------- | --------------------------------- | ----------------------------- |
| **Claude Code** | ✅ `Stop` hook                    | ✅ `SessionStart` caffeinate  |
| **Codex CLI**   | ✅ `notify` (agent-turn-complete) | ❌ no session-start event     |
| **OpenCode**    | ✅ `session.idle` event           | ✅ caffeinate at plugin load  |
| **Antigravity** | ⚠️ no finish/stop hook event (see below) | ⚠️ via session-start hook (experimental) |

## Install

### Claude Code

```sh
/plugin marketplace add TheEddy/foghorn
/plugin install foghorn@foghorn
```

Restart Claude Code after installing (hooks load at session start).

### Codex CLI

Codex runs a **notify program** on supported events, passing the event payload as a JSON
argument. Foghorn ships an adapter that blares a clip on `agent-turn-complete`.

1. Clone the repo somewhere stable:

   ```sh
   git clone https://github.com/TheEddy/foghorn.git ~/foghorn
   ```

2. Add the notify program to `~/.codex/config.toml`. **Root keys must come before any
   `[table]`**, so put this line at the very top of the file:

   ```toml
   notify = ["/bin/bash", "/Users/YOU/foghorn/adapters/codex/foghorn-notify.sh"]
   ```

   (Use the absolute path to your clone — Codex does not inject a plugin-root variable.)

3. Start Codex. A random clip plays on every completed turn.

> Codex has no session-start event, so the *keep-screen-awake* feature is not available there.

### Antigravity (experimental)

Antigravity supports plugins (`plugin.json` + optional `hooks.json`, staged under
`~/.gemini/antigravity-cli/plugins/<name>/`) and installs them with:

```sh
agy plugin install https://github.com/TheEddy/foghorn
```

**Caveat — the meme-blare is not wired for Antigravity yet.** Antigravity's documented hook
events are *pre-tool-call*, *post-file-edit*, and *session-start* — there is **no confirmed
"agent finished / stop" event** to hang the sound on. The screen-awake feature *can* be driven
from a session-start hook, but the exact event name/schema is not published, so we do not ship a
guessed `hooks.json`.

If your `agy` build exposes a turn-complete / stop event, wire it like the Claude Code hook —
PRs welcome. Template (replace the placeholder event name with the real one from `agy`'s docs):

```jsonc
{
  "hooks": {
    "<SESSION_START_EVENT>": [
      { "hooks": [ { "type": "command", "command": "nohup caffeinate -d -w $PPID >/dev/null 2>&1 &" } ] }
    ],
    "<AGENT_FINISH_EVENT>": [
      { "hooks": [ { "type": "command", "command": "bash \"${PLUGIN_DIR}/scripts/play-random.sh\"" } ] }
    ]
  }
}
```

### OpenCode

Clone the repo and point OpenCode at it so the bundled clips resolve. Either copy
`.opencode/plugin/foghorn.ts` into the repo you work in, or load it globally via
`~/.config/opencode/plugin/`. On `session.idle` it blares a clip; it also starts `caffeinate`
when the plugin loads.

## Layout

```
foghorn/
├── .claude-plugin/
│   ├── plugin.json              # Claude Code manifest
│   └── marketplace.json         # marketplace entry
├── hooks/hooks.json             # Claude Code: Stop + SessionStart hooks
├── adapters/codex/
│   └── foghorn-notify.sh        # Codex notify program
├── .opencode/plugin/
│   └── foghorn.ts               # OpenCode plugin
├── scripts/play-random.sh       # shared: picks a random clip, plays via afplay
└── assets/clips/*.mp3           # 40 meme sounds (shared by every adapter)
```

`scripts/play-random.sh` is CLI-agnostic — every adapter just invokes it, so there is one
source of truth for clip selection.

## Add / remove clips

Drop or delete `.mp3` files in `assets/clips/`. The player picks uniformly at random from whatever is there.
