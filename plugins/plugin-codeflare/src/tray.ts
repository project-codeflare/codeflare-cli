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

import open from "open"
import { Choices, Profiles } from "madwizard"
import { MenuItemConstructorOptions } from "electron"

import { productName } from "@kui-shell/client/config.d/name.json"
import { bugs, homepage, version } from "@kui-shell/client/package.json"

let tray: null | InstanceType<typeof import("electron").Tray> = null

function profileMenu(state: Choices.ChoiceState): MenuItemConstructorOptions {
  return { label: state.profile.name, type: "radio" }
}

async function profilesMenu(): Promise<MenuItemConstructorOptions> {
  const profiles = await Profiles.list({})

  return { label: "Profiles", submenu: profiles.map(profileMenu) }
}

async function buildContextMenu(/* createWindow: (argv: string[]) => void */) {
  const { Menu } = await import("electron")

  const contextMenu = Menu.buildFromTemplate([
    { label: `CodeFlare v${version}`, click: () => open(homepage) },
    { type: "separator" },
    await profilesMenu(),
    { type: "separator" },
    /* {
      label: `Test new window`,
      click: async () => {
        try {
          createWindow(["echo", "hello"])
        } catch (err) {
          console.error(err)
        }
      },
    }, */
    { label: `Report a Bug`, click: () => open(bugs.url) },
    { label: `Quit ${productName}`, role: "quit" },
  ])

  return contextMenu
}

export async function main(/* createWindow: (argv: string[]) => void */) {
  if (tray) {
    // only register one tray menu...
    return
  }

  const { app } = await import("electron")

  app
    .whenReady()
    .then(async () => {
      try {
        const { Tray } = await import("electron")
        tray = new Tray(require.resolve("@kui-shell/build/icons/png/codeflareTemplate.png"))

        tray.setToolTip(productName)
        tray.setContextMenu(await buildContextMenu(/* createWindow */))
      } catch (err) {
        console.error("Error registering electron tray menu", err)
      }
    })
    .catch((err) => {
      console.error("Error registering electron tray menu", err)
    })
}

export async function renderer(ipcRenderer: import("electron").IpcRenderer) {
  ipcRenderer.send(
    "/exec/invoke",
    JSON.stringify({
      module: "plugin-codeflare",
      main: "initTray",
      args: {
        command: "/tray/init",
      },
    })
  )
}
