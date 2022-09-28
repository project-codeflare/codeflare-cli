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

import { width, height } from "@kui-shell/client/config.d/style.json"

export async function openWindow(title: string, initialTabTitle: string, argv: (string | undefined)[]) {
  const { ipcRenderer } = await import("electron")

  ipcRenderer.send(
    "synchronous-message",
    JSON.stringify({
      operation: "new-window",
      title,
      initialTabTitle,
      width,
      height,
      argv,
    })
  )
}

export async function handleReset(selectedProfile: string | undefined) {
  if (selectedProfile) {
    const { Profiles } = await import("madwizard")
    await Profiles.reset({}, selectedProfile)
  }
}

export function handleBoot(selectedProfile: string | undefined) {
  openWindow(`Booting ${selectedProfile}`, "Booting", [
    "codeflare",
    "gui",
    "guide",
    "-y",
    "--profile",
    selectedProfile,
    "ml/ray/start/kubernetes",
  ])
}

export function handleShutdown(selectedProfile: string | undefined) {
  openWindow(`Shutting down ${selectedProfile}`, "Shutting down", [
    "codeflare",
    "gui",
    "guide",
    "-y",
    "--profile",
    selectedProfile,
    "ml/ray/stop",
  ])
}
