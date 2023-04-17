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
import type Options from "./options.js"

import tailf from "../tailf.js"
import usage from "../usage.js"
import dashboardUI from "../db.js"
import status from "./status/index.js"
import utilization from "./utilization/index.js"

import jobIdFrom from "./jobid.js"
import { enterAltBufferMode } from "../term.js"
import { KindA, isValidKindA } from "./kinds.js"
import { SupportedGrid, isSupportedGrid } from "./grids.js"

import type HistoryConfig from "./history.js"
import type { GridSpec } from "../../../components/Job/types.js"

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
  const usesGpus = opts.demo || (await import("../../env.js").then((_) => _.usesGpus(profile, jobId)))

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
