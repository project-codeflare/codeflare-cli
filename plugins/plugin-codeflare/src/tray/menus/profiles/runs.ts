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

import UpdateFunction from "../../update"
import ProfileRunWatcher, { RUNS_ERROR } from "../../watchers/profile/run"

/** Handler for "opening" the selected `runId` in the given `profile` */
type RunOpener = (profile: string, runId: string) => void

/**
 * TODO sort the runs by start time
 *
 * @return a menu for all runs of a profile
 */
export function runMenuItems(profile: string, open: RunOpener, runs: string[]): MenuItemConstructorOptions[] {
  return runs.slice(0, 10).map((run) => ({ label: run, click: () => open(profile, run) }))
}

/** Memo of `ProfileStatusWatcher`, keyed by profile name */
const watchers: Record<string, ProfileRunWatcher> = {}

/** @return menu items for the runs of the given profile */
export default async function submenuForRuns(
  profile: string,
  open: RunOpener,
  updateFn: UpdateFunction
): Promise<MenuItemConstructorOptions[]> {
  if (!watchers[profile]) {
    watchers[profile] = await new ProfileRunWatcher(updateFn, profile)
  }

  // one-time initialization of the watcher, if needed; we need to do
  // this after having assigned to our `watcher` variable, to avoid an
  // infinite loop
  await watchers[profile].init()

  const { runs } = watchers[profile]
  return runs.length && runs[0] !== RUNS_ERROR
    ? runMenuItems(profile, open, runs)
    : [{ label: RUNS_ERROR, enabled: false }]
}
