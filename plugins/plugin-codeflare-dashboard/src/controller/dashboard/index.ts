/*
 * Copyright 2023 The Kubernetes Authors
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

import type { Arguments } from "@kui-shell/core"

import tailf from "./tailf.js"
import dashboardUI from "./db.js"
import status from "./status.js"
import utilization from "./utilization.js"
import { SupportedGrid, isSupportedGrid } from "./grids.js"
import { KindA, isValidKindA, validKinds } from "./kinds.js"
import type { GridSpec } from "../../components/Dashboard/index.js"

export type Options = Arguments["parsedOptions"] & {
  s: number
  scale: number

  demo: boolean

  p: string
  profile: string
  theme: string
}

/** Behave like top, where the screen is cleared just for this process */
function enterAltBufferMode() {
  console.log("\x1b[?1049h")
}

export function usage(cmd: string, extraKinds: string[] = []) {
  return `Usage: codeflare ${cmd} ${extraKinds.concat(validKinds()).join("|")} [<jobId>|-N]`
}

async function lastNJob(profile: string, N: number) {
  const [{ join }, { readdir, stat }, { Profiles }] = await Promise.all([
    import("path"),
    import("fs/promises"),
    import("madwizard"),
  ])

  const dir = Profiles.guidebookJobDataPath({ profile })
  const files = await readdir(dir)
  if (files.length === 0) {
    throw new Error("No jobs available")
    return
  }

  const cTimes = await Promise.all(files.map((_) => stat(join(dir, _)).then((_) => _.ctime.getTime())))
  const sorted = files.map((file, idx) => ({ file, lastM: cTimes[idx] })).sort((a, b) => b.lastM - a.lastM)

  if (!sorted[N]) {
    throw new Error("Specified historical job not available")
  } else {
    return sorted[N].file
  }
}

export async function jobIdFrom(args: Arguments<Options>, cmd: string, offset = 2) {
  const profile = args.parsedOptions.p || (await import("madwizard").then((_) => _.Profiles.lastUsed()))

  const jobIdFromCommandLine = args.argvNoOptions[args.argvNoOptions.indexOf(cmd) + offset]
  const jobId = /^-\d+$/.test(jobIdFromCommandLine)
    ? await lastNJob(profile, -parseInt(jobIdFromCommandLine, 10))
    : jobIdFromCommandLine === undefined
    ? await lastNJob(profile, 0)
    : jobIdFromCommandLine

  return { jobId, profile }
}

export default async function dashboard(args: Arguments<Options>, cmd: "db" | "dashboard") {
  const { theme } = args.parsedOptions

  const { demo } = args.parsedOptions
  const scale = args.parsedOptions.s || 1

  const kind = args.argvNoOptions[args.argvNoOptions.indexOf(cmd) + 1] || "all"
  const { jobId, profile } = await jobIdFrom(args, cmd)

  if (!isValidKindA(kind)) {
    throw new Error(usage(cmd, ["all"]))
  } else if (!jobId) {
    throw new Error(usage(cmd, ["all"]))
  }

  const gridFor = async (kind: SupportedGrid): Promise<GridSpec> => {
    const tails = await tailf(kind, profile, jobId)
    return kind === "status"
      ? status(tails, { demo, theme, themeDefault: "colorbrewer" })
      : utilization(kind, tails, { demo, theme })
  }

  const gridForA = async (kind: KindA): Promise<null | GridSpec | (null | GridSpec)[]> => {
    if (kind === "all") {
      return Promise.all([
        gridFor("status"),
        null, // newline
        gridFor("cpu%"),
        gridFor("gpu%"),
        gridFor("mem%"),
        gridFor("gpumem%"),
      ])
    } else if (isSupportedGrid(kind)) {
      return gridFor(kind)
    } else {
      return null
    }
  }

  const db = dashboardUI(profile, jobId, await gridForA(kind), { scale })

  if (!db) {
    throw new Error(usage(cmd))
  } else {
    const { render } = await import("ink")

    if (process.env.ALT !== "false") {
      enterAltBufferMode()
    }

    const { waitUntilExit } = await render(db)
    await waitUntilExit()
    return true
  }
}
