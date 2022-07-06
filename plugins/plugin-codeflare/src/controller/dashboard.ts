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

export interface FollowOptions {
  f: boolean
  follow: boolean
}

export const followFlags: CommandOptions["flags"] = {
  boolean: ["f", "follow"],
  alias: { follow: ["f"] },
}

function dashboardcli(args: Arguments) {
  const filepath = args.argvNoOptions[1]
  if (!filepath) {
    throw new Error("Usage: codeflare dashboard <filepath>")
  }

  const restIdx = args.command.indexOf("dashboard") + "dashboard".length
  return args.REPL.qexec(`codeflare dashboardui ${args.command.slice(restIdx)}`)
}

async function dashboardui(args: Arguments<FollowOptions>) {
  const { setTabReadonly } = await import("@kui-shell/plugin-madwizard")
  setTabReadonly(args)

  const filepath = args.argvNoOptions[2]
  process.env.LOGDIR = filepath
  process.env.FOLLOW = args.parsedOptions.follow ? "-f" : ""

  return args.REPL.qexec(`tab new --cmdline "commentary --replace -f /kui/client/dashboard.md"`)
}

export default function registerDashboardCommands(registrar: Registrar) {
  const flags = followFlags

  registrar.listen("/dashboard", dashboardcli, { flags, outputOnly: true })
  registrar.listen("/codeflare/dashboardui", dashboardui, {
    needsUI: true,
    outputOnly: true,
    flags,
    width: 1280,
    height: 960,
  })
}
