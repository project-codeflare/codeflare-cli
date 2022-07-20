import { MenuItemConstructorOptions } from "electron"
import { Profiles } from "madwizard"
import { CreateWindowFunction } from "@kui-shell/core"
import { readdir } from "fs/promises"
import { join } from "path"

import windowOptions from "../window"

export const RUNS_ERROR = "No runs found"

/** @return a new Window with a dashboard of the selected job run */
function openRun(runId: string, createWindow: CreateWindowFunction) {
  const runsDir = Profiles.guidebookJobDataPath({})
  createWindow(
    ["codeflare", "dashboard", join(runsDir, runId)],
    windowOptions({ title: "CodeFlare Dashboard: " + runId })
  )
}

/** @return files of the directory of job runs for a given profile */
export async function readRunsDir(): Promise<string[]> {
  try {
    const runsDir = Profiles.guidebookJobDataPath({})
    return await readdir(runsDir)
  } catch (err) {
    return [RUNS_ERROR]
  }
}

/** @return a menu for all runs of a profile */
export function submenuForRuns(createWindow: CreateWindowFunction, runs: string[]): MenuItemConstructorOptions[] {
  return runs.map((run) => ({ label: run, click: () => openRun(run, createWindow) }))
}
