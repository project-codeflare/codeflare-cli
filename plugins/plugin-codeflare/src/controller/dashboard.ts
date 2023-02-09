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

import { basename } from "path"
import { productName } from "@kui-shell/client/config.d/name.json"
import { Arguments, CommandOptions, Registrar, encodeComponent, unparse } from "@kui-shell/core"

import "../../web/scss/components/Dashboard/_index.scss"

export interface FollowOptions {
  f: boolean
  follow: boolean
}

export type DashboardOptions = FollowOptions & {
  a: boolean | string
  attach: boolean | string

  p: string
  profile: string

  s: string
  store: string
}

export const followFlags: CommandOptions["flags"] = {
  boolean: ["f", "follow", "i", "y", "V"],
  alias: { follow: ["f"], attach: ["a"], profile: ["p"], store: ["s"] },
}

async function dashboardcli(args: Arguments<DashboardOptions>) {
  if (args.parsedOptions.attach) {
    // attach to a running job
    const logdir = await import("./attach").then((_) => _.default(args))
    return args.REPL.qexec(`codeflare dashboardui -f ${encodeComponent(logdir)}`)
  }

  const filepath = args.argvNoOptions[2]
  if (!filepath) {
    throw new Error("Usage: codeflare dashboard <filepath>")
  }

  return args.REPL.qexec(`codeflare dashboardui ${encodeComponent(filepath)} ${unparse(args.parsedOptions)}`)
}

async function dashboardui(args: Arguments<DashboardOptions>) {
  const { setTabReadonly } = await import("@kui-shell/plugin-madwizard/do")
  setTabReadonly(args)

  const filepath = args.argvNoOptions[2]
  process.env.LOGDIR = filepath
  process.env.FOLLOW = args.parsedOptions.follow ? "-f" : ""

  return args.REPL.qexec(`commentary -f /kui/client/dashboard.md`)
}

/** Desired window width */
export const width = 1280

/** Desired window height */
export const height = 960

export default function registerDashboardCommands(registrar: Registrar) {
  const flags = followFlags

  ;["dashboard", "db"].forEach((db) => registrar.listen(`/codeflare/${db}`, dashboardcli, { flags, outputOnly: true }))

  registrar.listen("/codeflare/dashboardui", dashboardui, {
    hidden: true,
    needsUI: true,
    outputOnly: true,
    flags,
    title: (argv: string[]) => productName + " Dashboard: " + basename(argv.filter((_) => !/^-/.test(_))[2]),
    width,
    height,
  })
}
