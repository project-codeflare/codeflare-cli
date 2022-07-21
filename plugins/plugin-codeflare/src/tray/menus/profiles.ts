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

import UpdateFunction from "../update"
import windowOptions from "../window"
import { profileIcon, bootIcon, shutDownIcon } from "../icons"
import { RUNS_ERROR, submenuForRuns, readRunsDir } from "./runs"

import ProfileStatusWatcher from "../watchers/profile/status"

/** Handler for booting up a profile */
async function boot(profile: string, createWindow: CreateWindowFunction) {
  createWindow(
    ["codeflare", "gui", "guide", "ml/ray/start/kubernetes", "--profile", profile],
    windowOptions({ title: "Booting " + profile })
  )
}

/** Handler for shutting down a profile */
async function shutdown(profile: string, createWindow: CreateWindowFunction) {
  createWindow(
    ["codeflare", "gui", "guide", "ml/ray/stop/kubernetes", "--profile", profile],
    windowOptions({ title: "Shutting down " + profile })
  )
}

const watchers: Record<string, ProfileStatusWatcher> = {}

/** @return a menu for the given profile */
function submenuForOneProfile(
  state: Choices.ChoiceState,
  createWindow: CreateWindowFunction,
  runs: string[],
  updateFunction: UpdateFunction
): MenuItemConstructorOptions {
  const isRunsSubMenu =
    runs.length && runs[0] !== RUNS_ERROR
      ? { label: "Runs", submenu: submenuForRuns(createWindow, runs) }
      : { label: RUNS_ERROR }
  if (!watchers[state.profile.name]) {
    watchers[state.profile.name] = new ProfileStatusWatcher(state.profile.name, updateFunction)
  }
  const watcher = watchers[state.profile.name]

  return {
    label: state.profile.name,
    submenu: [
      watcher.head,
      watcher.workers,
      { type: "separator" },
      { label: "Boot", icon: bootIcon, click: () => boot(state.profile.name, createWindow) },
      { label: "Shutdown", icon: shutDownIcon, click: () => shutdown(state.profile.name, createWindow) },
      { type: "separator" },
      isRunsSubMenu,
    ],
  }
}

/** @return a menu for all profiles */
export default async function profilesMenu(
  createWindow: CreateWindowFunction,
  updateFn: UpdateFunction
): Promise<MenuItemConstructorOptions> {
  const profiles = await Profiles.list({})
  const runs = await readRunsDir()

  return {
    label: "Profiles",
    icon: profileIcon,
    submenu: profiles.map((_) => submenuForOneProfile(_, createWindow, runs, updateFn)),
  }
}
