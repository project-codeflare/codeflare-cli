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

import windowOptions from "./window"
import { profileIcon, bootIcon, shutDownIcon } from "./icons"

/** Handler for booting up a profile */
async function boot(profile: string, createWindow: CreateWindowFunction) {
  createWindow(
    ["codeflare", "guide", "ml/ray/start/kubernetes", "--profile", profile],
    windowOptions({ title: "Booting " + profile })
  )
}

/** Handler for shutting down a profile */
async function shutdown(profile: string, createWindow: CreateWindowFunction) {
  createWindow(
    ["codeflare", "guide", "ml/ray/stop/kubernetes", "--profile", profile],
    windowOptions({ title: "Shutting down " + profile })
  )
}

/** @return a menu for the given profile */
function submenuForOneProfile(
  state: Choices.ChoiceState,
  createWindow: CreateWindowFunction
): MenuItemConstructorOptions {
  return {
    label: state.profile.name,
    submenu: [
      { label: "Boot", icon: bootIcon, click: () => boot(state.profile.name, createWindow) },
      { label: "Shutdown", icon: shutDownIcon, click: () => shutdown(state.profile.name, createWindow) },
    ],
  }
}

/** @return a menu for all profiles */
export default async function profilesMenu(createWindow: CreateWindowFunction): Promise<MenuItemConstructorOptions> {
  const profiles = await Profiles.list({})

  return { label: "Profiles", icon: profileIcon, submenu: profiles.map((_) => submenuForOneProfile(_, createWindow)) }
}
