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

import windowOptions from "../../window"
import { shutDownIcon } from "../../icons"

/** Handler for shutting down a profile */
async function shutdown(profile: string, createWindow: CreateWindowFunction) {
  createWindow(
    ["codeflare", "gui", "guide", "ml/ray/stop/kubernetes", "--profile", profile],
    windowOptions({ title: "Shutting down " + profile })
  )
}

export default function shutdownMenuItem(profile: string, createWindow: CreateWindowFunction) {
  return { label: "Shutdown", icon: shutDownIcon, click: () => shutdown(profile, createWindow) }
}
