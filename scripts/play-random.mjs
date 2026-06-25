#!/usr/bin/env node
// Foghorn: play one random meme clip. Cross-platform (macOS / Windows / Linux).
// Volume comes from ~/.config/foghorn/volume (afplay/MediaPlayer gain; 1.0 = normal).
import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { spawn } from "node:child_process"
import { homedir } from "node:os"

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = process.env.CLAUDE_PLUGIN_ROOT || join(here, "..")
const clipsDir = join(ROOT, "assets", "clips")

const cfgHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
function readVolume() {
  try {
    const v = readFileSync(join(cfgHome, "foghorn", "volume"), "utf8").trim()
    return /^\d+(\.\d+)?$/.test(v) ? v : "1.0"
  } catch {
    return "1.0"
  }
}

let clips = []
try {
  clips = readdirSync(clipsDir).filter((f) => f.toLowerCase().endsWith(".mp3"))
} catch {}
if (clips.length === 0) process.exit(0)

const file = join(clipsDir, clips[Math.floor(Math.random() * clips.length)])
const vol = readVolume()

function detached(cmd, args) {
  spawn(cmd, args, { detached: true, stdio: "ignore" }).unref()
}

if (process.platform === "darwin") {
  detached("afplay", ["-v", vol, file])
} else if (process.platform === "win32") {
  const v = Math.min(1, parseFloat(vol) || 1) // MediaPlayer.Volume is 0..1
  const ps = [
    "Add-Type -AssemblyName PresentationCore;",
    "$p = New-Object System.Windows.Media.MediaPlayer;",
    `$p.Open([uri]'${file.replace(/'/g, "''")}');`,
    `$p.Volume = ${v};`,
    "Start-Sleep -Milliseconds 300;",
    "$p.Play();",
    "$d = 8;",
    "if ($p.NaturalDuration.HasTimeSpan) { $d = [math]::Ceiling($p.NaturalDuration.TimeSpan.TotalSeconds) + 1 }",
    "Start-Sleep -Seconds $d;",
  ].join(" ")
  detached("powershell", ["-NoProfile", "-WindowStyle", "Hidden", "-Command", ps])
} else {
  // Linux best-effort: ffplay (volume 0..100), else mpg123, else paplay.
  const pct = String(Math.round((parseFloat(vol) || 1) * 100))
  detached("sh", [
    "-c",
    `command -v ffplay >/dev/null 2>&1 && exec ffplay -nodisp -autoexit -loglevel quiet -volume ${pct} "${file}"; ` +
      `command -v mpg123 >/dev/null 2>&1 && exec mpg123 -q "${file}"; ` +
      `command -v paplay >/dev/null 2>&1 && exec paplay "${file}"`,
  ])
}
