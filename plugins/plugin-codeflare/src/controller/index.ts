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

import { KResponse, Registrar } from "@kui-shell/core"
import { MadWizardOptions } from "@kui-shell/plugin-madwizard"

import tailf from "./tailf"
import browse from "./browse"
import charts from "./charts"
import events from "./events"
import dashboard from "./dashboard"
import description from "./description"

function help() {
  return `Usage:
codeflare [run] [<task>] [-s /path/to/store] [-u]
codeflare dashboard /path/to/logdir
codeflare chart gpu /path/to/logdir`
}

/** Register Kui Commands */
export default function registerCodeflareCommands(registrar: Registrar) {
  tailf(registrar)
  browse(registrar)
  charts(registrar)
  events(registrar)
  dashboard(registrar)
  description(registrar)
  registrar.listen("/help", help)

  registrar.listen("/codeflare/version", () => import("@kui-shell/client/package.json").then((_) => _.version))
  registrar.listen("/codeflare/gui/guide", (args) => import("./guide").then((_) => _.default(args)), {
    needsUI: true,
    width: 1280,
    height: 800,
  })

  registrar.listen("/codeflare/get/profile", (args) => import("./profile/get").then((_) => _.default(args)), {
    needsUI: true,
  })
  registrar.listen("/codeflare/get/run", (args) => import("./run/get").then((_) => _.default(args)), {
    needsUI: true,
    outputOnly: true,
  })

  // launch our hello guidebook
  registrar.listen("/codeflare/hello", (args) => import("./hello").then((_) => _.default(args)), {
    needsUI: true,
    outputOnly: true,
    width: 800,
    height: 600,
  })

  /**
   * Register a catch-all command handler: any `/^codeflare/` command
   * lines, send to madwizard.
   */
  registrar.catchall<KResponse, MadWizardOptions>(
    (argv: string[]) => argv[0] === "codeflare",
    (args) => import("./catchall").then((_) => _.default(args)),
    1
  )
}
