// Foghorn adapter for OpenCode.
//
// OpenCode auto-loads plugins from a project's .opencode/plugin/ directory
// (or the global ~/.config/opencode/plugin/). Point OpenCode at this repo so
// the bundled clips resolve correctly.
//
//   - Plays a random clip when the session goes idle (agent finished a turn).
//   - Keeps the macOS display awake for the life of the opencode process.
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, "..", "..") // .opencode/plugin -> repo root
const PLAYER = join(ROOT, "scripts", "play-random.sh")

export const Foghorn = async ({ $ }: { $: any }) => {
  // Keep the screen awake while opencode runs (macOS). Dies with this process.
  $`caffeinate -d -w ${process.pid}`.quiet().catch(() => {})

  return {
    event: async ({ event }: { event: { type: string } }) => {
      if (event.type === "session.idle") {
        await $`bash ${PLAYER}`.quiet().catch(() => {})
      }
    },
  }
}
