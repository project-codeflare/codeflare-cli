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

import Debug from "debug"
import { MadWizardOptions } from "madwizard"
import { Arguments, ParsedOptions } from "@kui-shell/core"

import { DashboardOptions } from "./dashboard"

export type Options = ParsedOptions &
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
export async function attach(
  profile: string,
  jobId: boolean | string,
  opts: MadWizardOptions = {},
  stderr: (line: string) => void
) {
  const debug = Debug("plugin-codeflare/attach")

  const deployGuidebook = "ml/ray/aggregator/in-cluster/client-side/deploy"
  const startGuidebook =
    typeof jobId === "string"
      ? "ml/ray/aggregator/in-cluster/client-side/start/with-jobid"
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
      interactive: false,
      verbose: true,
      store: process.env.GUIDEBOOK_STORE,
    },
    opts
  )

  const { cli } = await import("madwizard/dist/fe/cli")

  // *deploy* the aggregator pod, then *start* an aggregator instance
  // for the given jobId
  try {
    const deployOptions = Object.assign({}, options, { name: "log-aggregator-deploy" })
    debug("Deploying log aggregator", deployGuidebook, deployOptions)
    stderr("Deploying log aggregator...\n")
    await cli(["codeflare", "guide", deployGuidebook], undefined, deployOptions)
    debug("deploying log aggregator: done")
  } catch (err) {
    console.error("Error attaching", err)
    throw err
  }

  debug("attaching to", jobId)
  stderr("Attaching to job...\n")
  const resp = await cli(
    ["codeflare", "guide", startGuidebook],
    undefined,
    Object.assign({}, options, { name: "log-aggregator-start", clean: false })
  )

  // the logdir that we captured
  const logdir = resp && resp.env ? resp.env.LOGDIR_STAGE : undefined
  if (logdir) {
    debug("successfully attached to", jobId, logdir)
    stderr("Successfully attached to job")
  }

  return {
    logdir,
    cleanExit: resp ? resp.cleanExit : undefined,
  }
}

/**
 * Kui command handler that wraps `attach`.
 *
 * @return the local logdir for the run
 */
export default async function attachCommand(args: Arguments<Options>) {
  const Profiles = await import("madwizard").then((_) => _.Profiles)

  const jobId = args.parsedOptions.a
  const profile = args.parsedOptions.p || (await Profiles.lastUsed())

  const stderr = await args.createErrorStream()
  const { logdir, cleanExit } = await attach(profile, jobId, { verbose: args.parsedOptions.V }, stderr)

  if (logdir) {
    if (cleanExit) {
      window.addEventListener("beforeunload", () => cleanExit())
    }

    return logdir
  } else {
    throw new Error("Could not attach, due to missing logging directory")
  }

  // TODO: when job completes, auto-exit
  return true
}
