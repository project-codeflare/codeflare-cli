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

import { Arguments, ParsedOptions, ReactResponse, Registrar, Tab } from "@kui-shell/core"

export interface Options extends ParsedOptions {
  /** Run in UI mode */
  u: boolean

  /** verbose output */
  V: boolean

  /** do not load prior choices (the default "profile") */
  n: boolean

  /** Do not tee logs to the console */
  q: boolean
  quiet: boolean

  /** Automatically accept all choices from the current profile */
  a: boolean
  auto: boolean

  /** Interactive guide mode? [default: false] */
  i: boolean
  interactive: boolean
}

// TODO export this from madwizard
type Task = "profile" | "guide" | "plan"

export function doMadwizard(
  readonly: boolean,
  task: Task,
  withFilepath = false,
  cb?: (filepath: string, tab: Tab) => Promise<true | ReactResponse["react"]>
) {
  return async ({ tab, argvNoOptions, parsedOptions }: Arguments<Options>) => {
    if (withFilepath && !argvNoOptions[1]) {
      argvNoOptions.push("ml/codeflare")
    }

    if (!parsedOptions.u) {
      // CLI path
      const { cli } = await import("madwizard/dist/fe/cli/index.js")

      if (parsedOptions.q) {
        // TODO add this to madwizard?
        process.env.QUIET_CONSOLE = "true"
      }

      await cli(
        [
          "madwizard",
          task,
          ...argvNoOptions.slice(1),
          ...(parsedOptions.n ? ["--no-profile"] : []),
          ...(parsedOptions.i ? ["-i"] : []),
        ],
        undefined,
        {
          store: process.env.GUIDEBOOK_STORE,
          verbose: parsedOptions.V,
          interactive: parsedOptions.i || !parsedOptions.a,
        }
      )
      return true
    }

    // UI path
    if (readonly) {
      const { setTabReadonly } = await import("./util")
      setTabReadonly({ tab })
    }
    if (cb) {
      return {
        react: await cb(argvNoOptions[1], tab),
      }
    } else {
      return true
    }
  }
}

/** Register Kui Commands */
export default function registerMadwizardCommands(registrar: Registrar) {
  const flags = {
    boolean: ["u", "V", "n", "q", "i", "a"],
    alias: { quiet: ["q"], interactive: ["i"], auto: ["a"] },
  }

  registrar.listen("/profile", doMadwizard(true, "profile"))

  registrar.listen(
    "/guide",
    doMadwizard(true, "guide", true, (filepath, tab) =>
      import("./components/PlanAndGuide").then((_) => _.planAndGuide(filepath, { tab }))
    ),
    { outputOnly: true, flags }
  )

  registrar.listen(
    "/wizard",
    doMadwizard(false, "guide", true, (filepath, tab) =>
      import("./components/Guide").then((_) => _.guide(filepath, { tab }))
    ),
    { flags }
  )

  registrar.listen(
    "/plan",
    doMadwizard(false, "plan", true, (filepath) => import("./components/Plan").then((_) => _.plan(filepath))),
    { flags }
  )
}
