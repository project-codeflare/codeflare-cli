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

import { Capabilities } from "@kui-shell/core"

/**
 * This logic will be executed in the electron-renderer process, and
 * is called by Kui core whenever a new electron window opens (and
 * whenever a new headless process is launched; but we guard against
 * that via `!Capabilities.isHeadless()`.
 */
export default async function codeflarePreload() {
  if (!Capabilities.isHeadless()) {
    const { ipcRenderer } = await import("electron")
    import("./tray/renderer").then((_) => _.default(ipcRenderer))
  }
}
