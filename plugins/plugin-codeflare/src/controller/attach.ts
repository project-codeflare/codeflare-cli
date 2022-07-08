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

import { dir } from "tmp"
import { cli } from "madwizard/dist/fe/cli"
import { MadWizardOptions } from "madwizard"
import { Arguments, KResponse } from "@kui-shell/core"

export default async function attach(args: Arguments) {
  return new Promise<KResponse>((resolve, reject) => {
    dir({ prefix: "logdir-stage" }, async (err, logdir) => {
      if (err) {
        reject(err)
      }

      try {
        const options: MadWizardOptions = { store: process.env.GUIDEBOOK_STORE, clean: false }

        // TODO: update madwizard to accept env in the options
        process.env.LOGDIR_STAGE = logdir // stage log files here
        process.env.NO_WAIT = "true" // don't wait for job termination
        process.env.QUIET_CONSOLE = "true" // don't tee logs to the console

        /* const cleanup = */ await cli(["codeflare", "guide", "ml/ray/aggregator"], undefined, options)
        /* if (typeof cleanup === 'function') {
          onQuit(cleanup)
        } */

        await args.REPL.qexec(`codeflare dashboardui -f ${logdir}`)

        // TODO: when job completes, auto-exit

        resolve(true)
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
  })
}
