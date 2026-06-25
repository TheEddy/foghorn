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

| CLI            | Sound on finish              | Keep screen awake          |
| -------------- | ---------------------------- | -------------------------- |
| **Claude Code**| ✅ `Stop` hook               | ✅ `SessionStart` caffeinate |
| **Codex CLI**  | ✅ `notify` (agent-turn-complete) | ❌ no session-start event |
| **OpenCode**   | ✅ `session.idle` event      | ✅ caffeinate at plugin load |

## Install

### Claude Code

```sh
/plugin marketplace add TheEddy/foghorn
/plugin install foghorn@foghorn
```

Restart Claude Code after installing (hooks load at session start).

### Codex CLI

Clone the repo, then add a `notify` program to `~/.codex/config.toml`
(root keys must come before any `[table]`):

```toml
notify = ["/bin/bash", "/path/to/foghorn/adapters/codex/foghorn-notify.sh"]
```

Plays a random clip on every completed turn. (Codex has no session-start event,
so screen-awake is not available there.)

### OpenCode

Clone the repo and point OpenCode at it so the bundled clips resolve. Either copy
`.opencode/plugin/foghorn.ts` into the repo you work in, or load it globally via
`~/.config/opencode/plugin/`. On `session.idle` it blares a clip; it also starts
`caffeinate` when the plugin loads.

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
