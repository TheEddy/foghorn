#!/usr/bin/env node
// Foghorn adapter for OpenAI Codex CLI. Cross-platform.
//
// Codex invokes a notify program on events, passing the event payload as a
// single JSON argument (argv[2]). We blare a random clip on agent-turn-complete.
//
// Wire it up in ~/.codex/config.toml (root keys must precede any [table]):
//   notify = ["node", "/ABSOLUTE/PATH/TO/foghorn/adapters/codex/foghorn-notify.mjs"]
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const payload = process.argv[2] || ""
if (!payload.includes("agent-turn-complete")) process.exit(0)

const here = dirname(fileURLToPath(import.meta.url))
const player = join(here, "..", "..", "scripts", "play-random.mjs")
spawn(process.execPath, [player], { stdio: "ignore", detached: true }).unref()
