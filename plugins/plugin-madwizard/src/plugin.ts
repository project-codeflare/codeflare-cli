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
import { setTabReadonly } from "./util"

interface Options extends ParsedOptions {
  c: boolean
}

// TODO export this from madwizard
type Task = "guide" | "plan"

function withFilepath(
  readonly: boolean,
  task: Task,
  cb: (filepath: string, tab: Tab) => Promise<true | ReactResponse["react"]>
) {
  return async ({ tab, argvNoOptions, parsedOptions }: Arguments<Options>) => {
    if (!parsedOptions.u) {
      // CLI path
      await import("madwizard").then((_) =>
        _.CLI.cli(["madwizard", task, ...argvNoOptions.slice(1)], undefined, { store: process.env.GUIDEBOOK_STORE })
      )
      return true
    }

    // UI path
    if (readonly) {
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
    boolean: ["u"],
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
