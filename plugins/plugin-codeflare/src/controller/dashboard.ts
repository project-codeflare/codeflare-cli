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

import { Arguments, CommandOptions, Registrar } from "@kui-shell/core"

import "../../web/scss/components/Dashboard/_index.scss"

interface DashboardOptions {
  f: boolean
  follow: boolean
}

function dashboardcli(args: Arguments) {
  const filepath = args.argvNoOptions[1]
  if (!filepath) {
    throw new Error("Usage: codeflare dashboard <filepath>")
  }

  const restIdx = args.command.indexOf("dashboard") + "dashboard".length
  return args.REPL.qexec(`codeflare dashboardui ${args.command.slice(restIdx)}`)
}

async function dashboardui(args: Arguments<DashboardOptions>) {
  const { setTabReadonly } = await import("@kui-shell/plugin-madwizard")
  setTabReadonly(args)

  const filepath = args.argvNoOptions[2]
  process.env.LOGDIR = filepath

  const db = args.parsedOptions.follow ? "dashboard-live.md" : "dashboard.md"
  return args.REPL.qexec(`commentary -f /kui/client/${db}`)
}

export default function registerDashboardCommands(registrar: Registrar) {
  const flags: CommandOptions["flags"] = {
    boolean: ["f", "follow"],
    alias: { follow: ["f"] },
  }

  registrar.listen("/dashboard", dashboardcli, { flags })
  registrar.listen("/codeflare/dashboardui", dashboardui, {
    needsUI: true,
    outputOnly: true,
    flags,
    width: 1400,
    height: 1050,
  })
}
