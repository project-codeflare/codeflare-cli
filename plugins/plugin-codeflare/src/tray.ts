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

let tray: null | InstanceType<typeof import("electron").Tray> = null

export async function main() {
  const { app } = await import("electron")

  app
    .whenReady()
    .then(async () => {
      try {
        const { Menu, Tray } = await import("electron")
        tray = new Tray(require.resolve("@kui-shell/build/icons/png/codeflareTemplate@2x.png"))
        const contextMenu = Menu.buildFromTemplate([
          { label: "Item1", type: "radio" },
          { label: "Item2", type: "radio" },
          { label: "Item3", type: "radio", checked: true },
          { label: "Item4", type: "radio" },
        ])
        tray.setToolTip("CodeFlare")
        tray.setContextMenu(contextMenu)
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
