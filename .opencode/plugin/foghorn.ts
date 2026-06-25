// Foghorn adapter for OpenCode.
//
// OpenCode auto-loads plugins from a project's .opencode/plugin/ directory
// (or the global ~/.config/opencode/plugin/). Point OpenCode at this repo so
// the bundled clips resolve correctly.
//
//   - Plays a random clip when the session goes idle (agent finished a turn).
//   - Keeps the macOS display awake for the life of the opencode process,
//     unless disabled in ~/.config/foghorn/caffeinate.
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { readFileSync } from "node:fs"

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, "..", "..") // .opencode/plugin -> repo root
const PLAYER = join(ROOT, "scripts", "play-random.sh")

const configHome = process.env.XDG_CONFIG_HOME || join(process.env.HOME || "", ".config")

function keepAwakeEnabled(): boolean {
  try {
    return readFileSync(join(configHome, "foghorn", "caffeinate"), "utf8").trim() !== "off"
  } catch {
    return true // enabled by default
  }
}

export const Foghorn = async ({ $ }: { $: any }) => {
  if (keepAwakeEnabled()) {
    // Keep the screen awake while opencode runs (macOS). Dies with this process.
    $`caffeinate -d -w ${process.pid}`.quiet().catch(() => {})
  }

  return {
    event: async ({ event }: { event: { type: string } }) => {
      if (event.type === "session.idle") {
        await $`bash ${PLAYER}`.quiet().catch(() => {})
      }
    },
  }
}
