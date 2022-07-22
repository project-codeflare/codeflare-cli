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

import { join } from "path"
import { readdir } from "fs/promises"
import { Profiles } from "madwizard"
import { MenuItemConstructorOptions } from "electron"
import { CreateWindowFunction } from "@kui-shell/core"

import windowOptions from "../../window"

export const RUNS_ERROR = "No runs found"

/** @return a new Window with a dashboard of the selected job run */
function openRun(profile: string, runId: string, createWindow: CreateWindowFunction) {
  const runsDir = Profiles.guidebookJobDataPath({ profile })
  createWindow(
    ["codeflare", "dashboard", join(runsDir, runId)],
    windowOptions({ title: "CodeFlare Dashboard: " + runId })
  )
}

/** @return files of the directory of job runs for a given profile */
async function readRunsDir(profile: string): Promise<string[]> {
  try {
    // TODO do a "full" read with Dirents, so that we have filesystem
    // timestamps, and sort, so that the `.slice(0, 10)` below pulls
    // out the most recent runs
    return await readdir(Profiles.guidebookJobDataPath({ profile }))
  } catch (err) {
    return [RUNS_ERROR]
  }
}

/** @return a menu for all runs of a profile */
export function runMenuItems(
  profile: string,
  createWindow: CreateWindowFunction,
  runs: string[]
): MenuItemConstructorOptions[] {
  return runs.slice(0, 10).map((run) => ({ label: run, click: () => openRun(profile, run, createWindow) }))
}

/** @return menu items for the runs of the given profile */
export default async function submenuForRuns(
  profile: string,
  createWindow: CreateWindowFunction
): Promise<MenuItemConstructorOptions[]> {
  const runs = await readRunsDir(profile)

  return runs.length && runs[0] !== RUNS_ERROR ? runMenuItems(profile, createWindow, runs) : [{ label: RUNS_ERROR }]
}
