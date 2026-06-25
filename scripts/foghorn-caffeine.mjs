#!/usr/bin/env node
// Enable/disable Foghorn's keep-screen-awake. Enabled by default. Cross-platform.
// Stored in ~/.config/foghorn/caffeinate (on|off), read by keep-awake.mjs.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

const cfgDir = join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "foghorn")
const cfg = join(cfgDir, "caffeinate")

function current() {
  try {
    return readFileSync(cfg, "utf8").trim()
  } catch {
    return "on"
  }
}
function setState(s) {
  mkdirSync(cfgDir, { recursive: true })
  writeFileSync(cfg, s + "\n")
}

const key = (process.argv[2] || "status").toLowerCase()
switch (key) {
  case "status":
  case "get":
    console.log(`Foghorn keep-awake: ${current()}`)
    break
  case "on":
  case "enable":
    setState("on")
    console.log("Foghorn keep-awake enabled (starts at next session)")
    break
  case "off":
  case "disable":
    setState("off")
    console.log("Foghorn keep-awake disabled (takes effect next session)")
    break
  case "toggle": {
    const n = current() === "off" ? "on" : "off"
    setState(n)
    console.log(`Foghorn keep-awake ${n === "on" ? "enabled" : "disabled"}`)
    break
  }
  default:
    console.error("usage: foghorn-caffeine.mjs [status|on|off|toggle]")
    process.exit(1)
}
