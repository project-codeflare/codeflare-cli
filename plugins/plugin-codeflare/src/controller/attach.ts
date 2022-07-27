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

import { cli } from "madwizard/dist/fe/cli"
import { MadWizardOptions, Profiles } from "madwizard"
import { Arguments, encodeComponent } from "@kui-shell/core"

export default async function attach(args: Arguments) {
  const options: MadWizardOptions = {
    profile: await Profiles.lastUsed(),
    store: process.env.GUIDEBOOK_STORE,
    clean: false,
    interactive: args.parsedOptions.i || !args.parsedOptions.y,
  }

  // TODO: update madwizard to accept env in the options
  process.env.NO_WAIT = "true" // don't wait for job termination
  process.env.QUIET_CONSOLE = "true" // don't tee logs to the console

  const resp = await cli(["codeflare", "guide", "ml/ray/aggregator"], undefined, options)

  const logdir = resp && resp.env ? resp.env.LOGDIR_STAGE : undefined

  if (logdir) {
    process.env.LOGDIR = logdir
    await args.REPL.qexec(`codeflare dashboardui -f ${encodeComponent(logdir)}`)
  } else {
    throw new Error("Could not attach, due to missing logging directory")
  }

  // TODO: when job completes, auto-exit
  return true
}
