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

import { Choices, Profiles } from "madwizard"
import { MenuItemConstructorOptions } from "electron"
import { CreateWindowFunction } from "@kui-shell/core"

import boot from "./boot"
import shutdown from "./shutdown"
import submenuForRuns from "./runs"

import UpdateFunction from "../../update"
import { profileIcon } from "../../icons"

import ProfileStatusWatcher from "../../watchers/profile/status"

const watchers: Record<string, ProfileStatusWatcher> = {}

/** @return a menu for the given profile */
async function submenuForOneProfile(
  state: Choices.ChoiceState,
  createWindow: CreateWindowFunction,
  updateFunction: UpdateFunction
): Promise<MenuItemConstructorOptions> {
  if (!watchers[state.profile.name]) {
    watchers[state.profile.name] = new ProfileStatusWatcher(state.profile.name, updateFunction)
  }
  const watcher = watchers[state.profile.name]

  return {
    label: state.profile.name,
    icon: profileIcon,
    submenu: [
      boot(state.profile.name, createWindow),
      shutdown(state.profile.name, createWindow),
      { type: "separator" },
      { label: "Status", enabled: false },
      watcher.head,
      watcher.workers,
      { type: "separator" },
      ...(await submenuForRuns(createWindow)),
    ],
  }
}

/** @return a menu for all profiles */
export default async function profilesMenu(
  createWindow: CreateWindowFunction,
  updateFn: UpdateFunction
): Promise<MenuItemConstructorOptions[]> {
  const profiles = await Profiles.list({})

  return [
    {
      label: "Profiles",
      enabled: false,
    },
    ...(await Promise.all(profiles.map((_) => submenuForOneProfile(_, createWindow, updateFn)))),
  ]
}
