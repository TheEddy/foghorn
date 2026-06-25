<p align="center">
  <img src="assets/icon-400.png" width="180" alt="Foghorn icon">
</p>

<h1 align="center">📢 Foghorn</h1>

A coding-agent plugin (macOS · Windows · Linux) that:

- **Blares a random meme sound** when the agent finishes a turn — 40 clips from a soundboard.
- **Keeps the display awake** while a session runs, tied to the agent process so it auto-stops on exit.

Business in front, FAAAHHH in back.

> Cross-platform via small **Node** dispatchers (`node` already ships with every supported CLI).
> Each picks the native tool per OS — no extra installs:
> | | Play sound | Keep awake |
> |---|---|---|
> | **macOS** | `afplay` | `caffeinate` |
> | **Windows** | PowerShell `MediaPlayer` | `SetThreadExecutionState` |
> | **Linux** | `ffplay`/`mpg123`/`paplay` | `systemd-inhibit` |

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-theeddy-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/theeddy)

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
   notify = ["node", "/Users/YOU/foghorn/adapters/codex/foghorn-notify.mjs"]
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
      { "hooks": [ { "type": "command", "command": "node \"${PLUGIN_DIR}/scripts/play-random.mjs\"" } ] }
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
│   └── foghorn-notify.mjs       # Codex notify program
├── .opencode/plugin/
│   └── foghorn.ts               # OpenCode plugin
├── scripts/
│   ├── play-random.mjs          # pick + play a random clip (OS-dispatch)
│   ├── keep-awake.mjs           # hold a screen-awake assertion (OS-dispatch)
│   ├── foghorn-volume.mjs       # get/set/test volume
│   └── foghorn-caffeine.mjs     # enable/disable keep-awake
└── assets/clips/*.mp3           # 40 meme sounds (shared by every adapter)
```

The `scripts/*.mjs` dispatchers are CLI- and OS-agnostic — every adapter (Claude Code hooks,
Codex notify, OpenCode plugin) just invokes them, so there is one source of truth per behaviour.

## Add / remove clips

Drop or delete `.mp3` files in `assets/clips/`. The player picks uniformly at random from whatever is there.

## Volume

Playback volume is a gain (`1.0` = normal, `0` = mute, `2.0` = louder), stored in
`~/.config/foghorn/volume` and read on every CLI/OS — set it once, applies everywhere.

**Claude Code** — slash command:

```
/foghorn-volume         # show current volume
/foghorn-volume 0.5     # set to half
/foghorn-volume test    # play a clip at the current volume
```

**Any CLI** — run the script directly:

```sh
node scripts/foghorn-volume.mjs 0.5
```

## Keep screen awake

The display-awake feature is **on by default**. Toggle it with the shared config
at `~/.config/foghorn/caffeinate` (`on`/`off`) — applies to Claude Code and OpenCode, every OS.

**Claude Code** — slash command:

```
/foghorn-caffeine          # show status
/foghorn-caffeine off      # disable
/foghorn-caffeine on       # enable
```

**Any CLI** — run the script directly:

```sh
node scripts/foghorn-caffeine.mjs off
```

Changes take effect at the next session start.

## Support

If foghorn made you laugh (or kept your screen awake through a long run), buy me a coffee ☕

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-theeddy-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/theeddy)
