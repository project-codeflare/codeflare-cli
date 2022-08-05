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

import { MadWizardOptions } from "madwizard"
import { Arguments, ParsedOptions } from "@kui-shell/core"

import { DashboardOptions } from "./dashboard"

type Options = ParsedOptions &
  DashboardOptions & {
    /** verbose output from madwizard */
    V?: boolean
  }

/**
 * Attach to the given `jobId` running in the given `profile`
 *
 * @return the path to the captured log directory and a cleanup
 * handler to be invoked when you are done consuming the output
 */
export async function attach(profile: string, jobId: boolean | string, opts: MadWizardOptions = {}) {
  const deployGuidebook = "ml/ray/aggregator/in-cluster/client-side/deploy"
  const startGuidebook =
    typeof jobId === "string"
      ? "ml/ray/aggregator/in-cluster/client-side/start/with-jobId"
      : "ml/ray/aggregator/in-cluster/client-side/start"

  // TODO: update madwizard to accept env in the options
  process.env.NO_WAIT = "true" // don't wait for job termination
  process.env.QUIET_CONSOLE = "true" // don't tee logs to the console
  if (typeof jobId === "string") {
    process.env.JOB_ID = jobId
  }

  const options: MadWizardOptions = Object.assign(
    {
      profile,
      clean: false,
      interactive: false,
      verbose: true,
      store: process.env.GUIDEBOOK_STORE,
    },
    opts
  )

  // *deploy* the aggregator pod, then *start* an aggregator instance
  // for the given jobId
  const { cli } = await import("madwizard/dist/fe/cli")
  await cli(
    ["codeflare", "guide", deployGuidebook],
    undefined,
    Object.assign({}, options, { name: "log-aggregator-deploy" })
  )
  const resp = await cli(
    ["codeflare", "guide", startGuidebook],
    undefined,
    Object.assign({}, options, { name: "log-aggregator-start" })
  )

  // the logdir that we captured
  const logdir = resp && resp.env ? resp.env.LOGDIR_STAGE : undefined

  return {
    logdir,
    cleanExit: resp ? resp.cleanExit : undefined,
  }
}

/**
 * Kui command handler that wraps `attach`, and opens a dashboard
 * window that visualizes the contents the produced log directory.
 */
export default async function attachCommand(args: Arguments<Options>) {
  const [{ encodeComponent }, { Profiles }] = await Promise.all([import("@kui-shell/core"), import("madwizard")])

  const jobId = args.parsedOptions.a
  const profile = args.parsedOptions.p || (await Profiles.lastUsed())

  const resp = await attach(profile, jobId, { verbose: args.parsedOptions.V })

  if (resp.logdir) {
    process.env.LOGDIR = resp.logdir
    await args.REPL.qexec(`codeflare dashboardui -f ${encodeComponent(resp.logdir)}`)
    // TODO utilize resp.cleanExit?
  } else {
    throw new Error("Could not attach, due to missing logging directory")
  }

  // TODO: when job completes, auto-exit
  return true
}
