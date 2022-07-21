/*
 * Copyright 2022 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
async function readRunsDir(): Promise<string[]> {
  try {
    const runsDir = Profiles.guidebookJobDataPath({})
    return await readdir(runsDir)
  } catch (err) {
    return [RUNS_ERROR]
  }
}

/** @return a menu for all runs of a profile */
export function runMenuItems(createWindow: CreateWindowFunction, runs: string[]): MenuItemConstructorOptions[] {
  return runs.map((run) => ({ label: run, click: () => openRun(run, createWindow) }))
}

export default async function submenuForRuns(
  createWindow: CreateWindowFunction
): Promise<MenuItemConstructorOptions[]> {
  const runs = await readRunsDir()

  return [
    { label: "Recent Runs", enabled: false },
    ...(runs.length && runs[0] !== RUNS_ERROR ? runMenuItems(createWindow, runs) : [{ label: RUNS_ERROR }]),
  ]
}
