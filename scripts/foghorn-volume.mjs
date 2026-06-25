#!/usr/bin/env node
// Get/set Foghorn playback volume. Cross-platform.
// Volume is a gain (1.0 = normal, 0 = mute, 2.0 = louder), stored in
// ~/.config/foghorn/volume and read by play-random.mjs on every CLI.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { homedir } from "node:os"
import { join, dirname } from "node:path"
import { spawn } from "node:child_process"

const cfgDir = join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "foghorn")
const cfg = join(cfgDir, "volume")

function current() {
  try {
    return readFileSync(cfg, "utf8").trim()
  } catch {
    return "1.0"
  }
}

const arg = process.argv[2]
const key = (arg || "get").toLowerCase()

if (key === "get" || key === "show") {
  console.log(`Foghorn volume: ${current()}`)
} else if (key === "test") {
  const here = dirname(fileURLToPath(import.meta.url))
  console.log(`Playing test clip at volume ${current()}…`)
  spawn(process.execPath, [join(here, "play-random.mjs")], { stdio: "ignore", detached: true }).unref()
} else if (/^\d+(\.\d+)?$/.test(arg)) {
  mkdirSync(cfgDir, { recursive: true })
  writeFileSync(cfg, arg + "\n")
  console.log(`Foghorn volume set to ${arg}`)
} else {
  console.error("error: volume must be a number >= 0 (e.g. 0.5, 1.0, 2.0)")
  process.exit(1)
}
