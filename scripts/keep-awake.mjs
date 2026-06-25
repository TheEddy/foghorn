#!/usr/bin/env node
// Foghorn: keep the screen awake for the session. Cross-platform.
// Gated on ~/.config/foghorn/caffeinate (on by default).
// argv[2] = pid to tie the assertion to (the agent process). When it is not a
// number (e.g. a Windows hook shell did not expand $PPID) we fall back to an
// 8h timeout so a stuck assertion can never outlive the day.
import { readFileSync } from "node:fs"
import { spawn } from "node:child_process"
import { homedir } from "node:os"
import { join } from "node:path"

const cfgHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
let state = "on"
try {
  state = readFileSync(join(cfgHome, "foghorn", "caffeinate"), "utf8").trim()
} catch {}
if (state === "off") process.exit(0)

const arg = process.argv[2]
const pid = /^\d+$/.test(arg || "") ? parseInt(arg, 10) : null
const TIMEOUT = 28800 // 8h fallback

function detached(cmd, args) {
  spawn(cmd, args, { detached: true, stdio: "ignore" }).unref()
}

if (process.platform === "darwin") {
  detached("caffeinate", pid ? ["-d", "-w", String(pid)] : ["-d", "-t", String(TIMEOUT)])
} else if (process.platform === "win32") {
  const wait = pid
    ? `try { Wait-Process -Id ${pid} -ErrorAction SilentlyContinue } catch {}`
    : `Start-Sleep -Seconds ${TIMEOUT}`
  const ps = [
    "$sig = '[DllImport(\"kernel32.dll\")] public static extern uint SetThreadExecutionState(uint e);';",
    "$k = Add-Type -MemberDefinition $sig -Name P -Namespace W -PassThru;",
    "$ES_CONTINUOUS = 2147483648; $ES_DISPLAY = 2;",
    "$k::SetThreadExecutionState($ES_CONTINUOUS -bor $ES_DISPLAY) | Out-Null;",
    wait + ";",
    "$k::SetThreadExecutionState($ES_CONTINUOUS) | Out-Null;",
  ].join(" ")
  detached("powershell", ["-NoProfile", "-WindowStyle", "Hidden", "-Command", ps])
} else {
  // Linux best-effort via systemd-inhibit, tied to the pid if we have one.
  const guard = pid ? `while kill -0 ${pid} 2>/dev/null; do sleep 5; done` : `sleep ${TIMEOUT}`
  detached("sh", [
    "-c",
    `command -v systemd-inhibit >/dev/null 2>&1 && exec systemd-inhibit --what=idle --who=foghorn --why=session sh -c '${guard}'`,
  ])
}
