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

import { Profiles } from "madwizard"
import { MenuItemConstructorOptions } from "electron"
import { CreateWindowFunction } from "@kui-shell/core"

// import status from "./status"
import tasks from "./tasks"
import dashboards from "./dashboards"
import activeRuns from "./active-runs"

import section from "../section"
import UpdateFunction from "../../update"
import { profileIcon } from "../../icons"
import ProfileWatcher from "../../watchers/profile/list"

/** @return a menu for the given `profile` */
async function profileMenu(
  createWindow: CreateWindowFunction,
  updateFn: UpdateFunction,
  profileObj: Profiles.Profile
): Promise<MenuItemConstructorOptions> {
  const profile = profileObj.name

  return {
    label: profile,
    icon: profileIcon,
    submenu: [
      // ...section("Status", status(profile, updateFn)),
      ...section("Dashboards", await dashboards(profile, createWindow, updateFn)),
      ...section("Tasks", tasks(profile, createWindow)),
      ...section("Active Runs", await activeRuns(profile, createWindow, updateFn)),
    ],
  }
}

/** Memo of `ProfileWatcher`, which will watch for new/removed/renamed profiles */
let watcher: null | ProfileWatcher = null

/** @return a menu for all profiles */
export default async function profilesMenu(
  createWindow: CreateWindowFunction,
  updateFn: UpdateFunction
): Promise<MenuItemConstructorOptions[]> {
  if (!watcher) {
    watcher = new ProfileWatcher(updateFn, await Profiles.profilesPath({}, true))

    // we need to close the chokidar watcher before exit, otherwise
    // electron-main dies with SIGABRT
    import("electron").then((_) =>
      _.app.on("will-quit", async () => {
        if (watcher) {
          await watcher.close()
        }
      })
    )
  }

  // one-time initialization of the watcher, if needed; we need to do
  // this after having assigned to our `watcher` variable, to avoid an
  // infinite loop
  await watcher.init()

  // this will be a list of menu items, one per profile, and sorted by
  // profile name
  const profiles = await Promise.all(
    watcher.profiles // current list of profiles
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(profileMenu.bind(undefined, createWindow, updateFn))
  )

  return section("Profiles", profiles, false)
}
