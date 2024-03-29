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
import { MadWizardOptions, flags } from "@kui-shell/plugin-madwizard/do"

import { width, height } from "@kui-shell/client/config.d/style.json"

import tailf from "./tailf"
import charts from "./charts"
import events from "./events"
// import dashboard from "./dashboard"
import description from "./description"
import { LogsOptions, logsFlags } from "./logs"
import { Options as AttachOptions } from "./attach"

function help() {
  return `Usage:
codeflare [run] [<task>] [-s /path/to/store] [-u]
codeflare chart gpu /path/to/logdir`
}

/** Register Kui Commands */
export default function registerCodeflareCommands(registrar: Registrar) {
  tailf(registrar)
  charts(registrar)
  events(registrar)
  // dashboard(registrar)
  description(registrar)
  registrar.listen("/help", help)

  registrar.listen<KResponse, LogsOptions>("/codeflare/logs", (args) => import("./logs").then((_) => _.default(args)), {
    flags: logsFlags,
  })

  registrar.listen<KResponse, AttachOptions>(
    "/codeflare/attach",
    (args) => import("./attach").then((_) => _.default(args)),
    { flags: Object.assign({}, flags, { boolean: ["wait"].concat(flags.boolean) }) }
  )

  registrar.listen("/codeflare/version", (args) =>
    import("@kui-shell/client/package.json").then((_) => {
      if (!args.execOptions.type) {
        return _.version + "\n"
      } else {
        return _.version
      }
    })
  )

  registrar.listen("/codeflare/gui/guide", (args) => import("./guide").then((_) => _.default(args)), {
    needsUI: true,
    width,
    height,
  })

  registrar.listen("/codeflare/get/run", (args) => import("./run/get").then((_) => _.default(args)), {
    needsUI: true,
    outputOnly: true,
  })

  // launch our explore guidebook
  ;["ui", "explore", "explorer", "hello"].forEach((explore) =>
    registrar.listen(
      `/codeflare/${explore}`,
      (args) => {
        if (args.parsedOptions.s) {
          process.env.GUIDEBOOK_STORE = args.parsedOptions.s
        }
        return args.REPL.qexec("commentary --readonly -f /kui/client/hello.md")
      },
      {
        needsUI: true,
        outputOnly: true,
        width,
        height,
      }
    )
  )

  /**
   * Launch the gallery with asciinema plays
   */
  /* registrar.listen("/codeflare/gallery", () => import("./hello").then((_) => _.gallery()), {
    outputOnly: true,
  }) */

  /**
   * Launch a gallery with the example dashboards
   */
  // registrar.listen("/codeflare/dashboard-gallery", (args) => import("./hello").then((_) => _.dashboardGallery(args)))

  /** Open a plain terminal */
  /* registrar.listen("/codeflare/terminal/shell", (args) => import("./terminal").then((_) => _.shell(args)), {
    needsUI: true,
  }) */

  registrar.catchall<KResponse, MadWizardOptions>(
    (argv) => argv[0] === "codeflare" && argv[1] === "profile",
    (args) => import("./catchall").then((_) => _.profile(args)),
    10
  )

  /**
   * Register a catch-all command handler: any `/^codeflare/` command
   * lines, send to madwizard.
   */
  registrar.catchall<KResponse, MadWizardOptions>(
    (argv: string[]) => argv[0] === "codeflare",
    (args) => import("./catchall").then((_) => _.default(args)),
    1,
    { flags }
  )
}
