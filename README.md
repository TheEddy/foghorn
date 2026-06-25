# 📢 Foghorn

A Claude Code plugin (macOS) that:

- **Blares a random meme sound** when the agent docks — i.e. finishes a turn (`Stop` hook). 40 clips from a soundboard.
- **Keeps the display awake** for the whole session (`SessionStart` hook → `caffeinate -d`, tied to the Claude process so it auto-stops on exit).

Business in front, FAAAHHH in back.

## Layout

```
foghorn/
├── .claude-plugin/
│   ├── plugin.json          # manifest
│   └── marketplace.json     # local marketplace entry
├── hooks/hooks.json         # Stop + SessionStart hooks
├── scripts/play-random.sh   # picks a random clip, plays via afplay
└── assets/clips/*.mp3       # 40 meme sounds
```

## Install (local)

```sh
/plugin marketplace add /Volumes/Ext-Drive/agent_notifier
/plugin install foghorn@foghorn-marketplace
```

Or load for one session without installing:

```sh
claude --plugin-dir /Volumes/Ext-Drive/agent_notifier
```

## Notes

- macOS only (`afplay`, `caffeinate`).
- Hooks load on session start; restart Claude Code after installing.
- If you previously added the same hooks to `~/.claude/settings.json`, **remove that `hooks` block** so sounds don't fire twice.

## Add / remove clips

Drop or delete `.mp3` files in `assets/clips/`. The player picks uniformly at random from whatever is there.
