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

import status from "./status"
import tasks from "./tasks"
import dashboards from "./dashboards"

import section from "../section"
import UpdateFunction from "../../update"
import { profileIcon } from "../../icons"

/** @return a menu for the given `profile` */
async function profileMenu(
  profileObj: Profiles.Profile,
  createWindow: CreateWindowFunction,
  updateFunction: UpdateFunction
): Promise<MenuItemConstructorOptions> {
  const profile = profileObj.name

  return {
    label: profile,
    icon: profileIcon,
    submenu: [
      ...section("Status", status(profile, updateFunction)),
      ...section("Dashboards", await dashboards(profile, createWindow)),
      ...section("Tasks", tasks(profile, createWindow)),
    ],
  }
}

/** @return a menu for all profiles */
export default async function profilesMenu(
  createWindow: CreateWindowFunction,
  updateFn: UpdateFunction
): Promise<MenuItemConstructorOptions[]> {
  // this will be a list of menu items, one per profile, and sorted by
  // profile name
  const profiles = await Promise.all(
    (await Profiles.list({}))
      .sort((a, b) => a.profile.name.localeCompare(b.profile.name))
      .map((_) => profileMenu(_.profile, createWindow, updateFn))
  )

  return section("Profiles", profiles, false)
}
