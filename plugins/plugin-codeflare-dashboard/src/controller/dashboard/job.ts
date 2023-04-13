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

import Debug from "debug"
import type { Arguments } from "@kui-shell/core"

import tailf from "./tailf.js"
import dashboardUI from "./db.js"
import status from "./status/index.js"
import utilization from "./utilization/index.js"

import { enterAltBufferMode } from "./term.js"
import { SupportedGrid, isSupportedGrid } from "./grids.js"
import { KindA, isValidKindA, validKinds } from "./kinds.js"

import type HistoryConfig from "./history.js"
import type { GridSpec } from "../../components/Job/types.js"

export type Options = Arguments["parsedOptions"] & {
  s: number
  scale: number

  demo: boolean

  p: string
  profile: string
  theme: string

  /** Frequency of updates to the timeline, in seconds */
  u: number
  "update-frequency": number
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

/** @return grid model for the given `kind` for `jobId` in `profile` */
async function gridFor(
  kind: SupportedGrid,
  profile: string,
  jobId: string,
  historyConfig: HistoryConfig,
  opts: Pick<Options, "demo" | "theme" | "events">
): Promise<GridSpec> {
  const tails = await tailf(kind, profile, jobId)
  return kind === "status" ? status(tails, historyConfig, opts) : utilization(kind, tails, historyConfig, opts)
}

/** @return all relevant grid models for `jobId` in `profile` */
async function allGridsFor(
  profile: string,
  jobId: string,
  historyConfig: HistoryConfig,
  opts: Pick<Options, "demo" | "theme" | "events">
) {
  const usesGpus = opts.demo || (await import("../env.js").then((_) => _.usesGpus(profile, jobId)))

  const all = [
    gridFor("status", profile, jobId, historyConfig, opts),
    null, // newline
    gridFor("cpu%", profile, jobId, historyConfig, opts),
  ]

  if (usesGpus) {
    all.push(gridFor("gpu%", profile, jobId, historyConfig, opts))
  }

  all.push(gridFor("mem%", profile, jobId, historyConfig, opts))

  if (usesGpus) {
    all.push(gridFor("gpumem%", profile, jobId, historyConfig, opts))
  }

  return Promise.all(all)
}

export default async function dashboard(args: Arguments<Options>) {
  const debug = Debug("plugin-codeflare-dashboard/controller/dashboard")
  debug("setup")

  const { demo, theme, events } = args.parsedOptions

  const scale = args.parsedOptions.s || 1

  const jobIdOffset = args.argvNoOptions[args.argvNoOptions.indexOf("job") + 2] ? 2 : 1
  const kindOffset = jobIdOffset === 2 ? 1 : 9999
  const kind = args.argvNoOptions[args.argvNoOptions.indexOf("job") + kindOffset] || "all"
  const { jobId, profile } = await jobIdFrom(args, "job", jobIdOffset)

  debug("jobId", jobId)
  debug("profile", profile)

  if (!isValidKindA(kind)) {
    throw new Error(usage("top job", ["all"]))
  } else if (!jobId) {
    throw new Error(usage("top job", ["all"]))
  }

  const gridForA = async (
    kind: KindA,
    historyConfig: HistoryConfig
  ): Promise<null | GridSpec | (null | GridSpec)[]> => {
    if (kind === "all") {
      return allGridsFor(profile, jobId, historyConfig, { demo, theme, events })
    } else if (isSupportedGrid(kind)) {
      return gridFor(kind, profile, jobId, historyConfig, { demo, theme, events })
    } else {
      return null
    }
  }

  const historyConfig: HistoryConfig = {
    width: args.parsedOptions.u ? 1000 * args.parsedOptions.u : 5000,
  }

  const grids = await gridForA(kind, historyConfig)
  debug("grids", grids)

  const db = dashboardUI(profile, jobId, grids, { scale })

  if (!db) {
    throw new Error(usage("top job"))
  } else {
    const { render } = await import("ink")

    if (process.env.ALT !== "false" && !debug.enabled) {
      enterAltBufferMode()
    }

    const { waitUntilExit } = await render(db)
    await waitUntilExit()
    return true
  }
}
