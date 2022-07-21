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

import { CreateWindowFunction } from "@kui-shell/core"

import { productName } from "@kui-shell/client/config.d/name.json"
import { bugs, homepage, version } from "@kui-shell/client/package.json"

import profilesMenu from "./profiles"
import UpdateFunction from "../update"
import { bugIcon, powerOffIcon } from "../icons"

/** @return an Electron `Menu` model for our tray menu */
export default async function buildContextMenu(
  createWindow: CreateWindowFunction,
  updateFn: UpdateFunction
): Promise<import("electron").Menu> {
  const { Menu } = await import("electron")

  const contextMenu = Menu.buildFromTemplate([
    { label: `Open CodeFlare`, click: () => createWindow([]) },
    { type: "separator" },
    ...(await profilesMenu(createWindow, updateFn)),
    { type: "separator" },
    { label: `Version ${version}`, enabled: false },
    { label: `About CodeFlare`, click: () => import("open").then((_) => _.default(homepage)) },
    { type: "separator" },
    { label: `Report a Bug`, icon: bugIcon, click: () => import("open").then((_) => _.default(bugs.url)) },
    { label: `Quit ${productName}`, icon: powerOffIcon, role: "quit" },
  ])

  return contextMenu
}
