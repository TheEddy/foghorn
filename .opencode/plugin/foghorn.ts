// Foghorn adapter for OpenCode.
//
// OpenCode auto-loads plugins from a project's .opencode/plugin/ directory
// (or the global ~/.config/opencode/plugin/). Point OpenCode at this repo so
// the bundled clips resolve correctly.
//
//   - Plays a random clip when the session goes idle (agent finished a turn).
//   - Keeps the screen awake for the life of the opencode process (unless
//     disabled in ~/.config/foghorn/caffeinate).
//
// Both behaviours run through the cross-platform Node dispatchers in scripts/,
// so this works on macOS, Windows, and Linux.
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { spawn } from "node:child_process"

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, "..", "..") // .opencode/plugin -> repo root
const PLAYER = join(ROOT, "scripts", "play-random.mjs")
const KEEP_AWAKE = join(ROOT, "scripts", "keep-awake.mjs")

function run(script: string, args: string[] = []) {
  spawn(process.execPath, [script, ...args], { stdio: "ignore", detached: true }).unref()
}

export const Foghorn = async () => {
  // keep-awake.mjs self-gates on the shared config; pass the opencode pid.
  run(KEEP_AWAKE, [String(process.pid)])

  return {
    event: async ({ event }: { event: { type: string } }) => {
      if (event.type === "session.idle") run(PLAYER)
    },
  }
}
