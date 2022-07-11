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

interface Options extends ParsedOptions {
  /** Run in UI mode */
  u: boolean

  /** verbose output */
  V: boolean

  /** do not load prior choices (the default "profile") */
  n: boolean

  /** Do not tee logs to the console */
  q: boolean
  quiet: boolean

  /** Interactive guide mode? [default: false] */
  i: boolean
  interactive: boolean
}

// TODO export this from madwizard
type Task = "guide" | "plan"

function withFilepath(
  readonly: boolean,
  task: Task,
  cb: (filepath: string, tab: Tab) => Promise<true | ReactResponse["react"]>
) {
  return async ({ tab, argvNoOptions, parsedOptions }: Arguments<Options>) => {
    if (!argvNoOptions[1]) {
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
        { store: process.env.GUIDEBOOK_STORE, verbose: parsedOptions.V }
      )
      return true
    }

    // UI path
    if (readonly) {
      const { setTabReadonly } = await import("./util")
      setTabReadonly({ tab })
    }
    return {
      react: await cb(argvNoOptions[1], tab),
    }
  }
}

/** Register Kui Commands */
export default function registerMadwizardCommands(registrar: Registrar) {
  const flags = {
    boolean: ["u", "V", "n", "q", "i"],
    alias: { quiet: ["q"], interactive: ["i"] },
  }

  registrar.listen(
    "/guide",
    withFilepath(true, "guide", (filepath, tab) =>
      import("./components/PlanAndGuide").then((_) => _.planAndGuide(filepath, { tab }))
    ),
    { outputOnly: true, flags }
  )

  registrar.listen(
    "/wizard",
    withFilepath(false, "guide", (filepath, tab) =>
      import("./components/Guide").then((_) => _.guide(filepath, { tab }))
    ),
    { flags }
  )

  registrar.listen(
    "/plan",
    withFilepath(false, "plan", (filepath) => import("./components/Plan").then((_) => _.plan(filepath))),
    { flags }
  )
}
