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
import { join } from "path"
import { Menu } from "electron"
import { CreateWindowFunction } from "@kui-shell/core"

import profilesMenu from "./profiles"
import { bugIcon, powerOffIcon } from "./icons"

import { productName } from "@kui-shell/client/config.d/name.json"
import { bugs, version } from "@kui-shell/client/package.json"

// these our are tray menu icons; the electron api specifies that if
// the files are named fooTemplate, then it will take care of
// rendering them as a "template icon" via underlying platform apis
import icon from "@kui-shell/client/icons/png/codeflareTemplate.png"
import icon2x from "@kui-shell/client/icons/png/codeflareTemplate@2x.png"

// we only want one tray menu, so we need to squirrel away a reference
// somewhere
let tray: null | InstanceType<typeof import("electron").Tray> = null

/** @return an Electron `Menu` model for our tray menu */
async function buildContextMenu(createWindow: CreateWindowFunction): Promise<Menu> {
  const { Menu } = await import("electron")

  const contextMenu = Menu.buildFromTemplate([
    { label: `CodeFlare v${version}`, click: () => createWindow([]) },
    { type: "separator" },
    await profilesMenu(createWindow),
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
    { label: `Report a Bug`, icon: bugIcon, click: () => open(bugs.url) },
    { label: `Quit ${productName}`, icon: powerOffIcon, role: "quit" },
  ])

  return contextMenu
}

/**
 * This is the logic that will be executed in the *electron-main*
 * process for tray menu registration. This will be invoked by our
 * `electron-main.ts`, via the `renderer` function below, which in
 * turn is called from our `preload.ts`.
 */
export default async function main(createWindow: CreateWindowFunction) {
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

        const iconHome = process.env.CODEFLARE_HEADLESS || join(process.argv0, "../../Resources/app/dist/headless")
        if (iconHome) {
          // this forces webpack to include the @2x template images in
          // the build
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const fake = "dist/headless/" + icon2x

          tray = new Tray(join(iconHome, icon))
          tray.setToolTip(productName)
          tray.setContextMenu(await buildContextMenu(createWindow))
        } else {
          console.error("Cannot register electron tray menu, because CODEFLARE_HEADLESS environment variable is absent")
        }
      } catch (err) {
        console.error("Error registering electron tray menu", err)
      }
    })
    .catch((err) => {
      console.error("Error registering electron tray menu", err)
    })
}
