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

import { resolve } from "path"
import { Arguments, ReactResponse, Registrar, Tab } from "@kui-shell/core"
import { setTabReadonly } from "./util"

function withFilepath(cb: (filepath: string, tab: Tab) => Promise<ReactResponse["react"]>) {
  return async ({ tab, argvNoOptions }: Arguments) => {
    const filepath = resolve(argvNoOptions[1])
    setTabReadonly({ tab })
    return {
      react: await cb(filepath, tab),
    }
  }
}

/** Register Kui Commands */
export default function registerMadwizardCommands(registrar: Registrar) {
  registrar.listen(
    "/guide",
    withFilepath((filepath, tab) => import("./components/PlanAndGuide").then((_) => _.planAndGuide(filepath, { tab }))),
    { outputOnly: true }
  )

  registrar.listen(
    "/wizard",
    withFilepath((filepath, tab) => import("./components/Guide").then((_) => _.guide(filepath, { tab })))
  )

  registrar.listen(
    "/plan",
    withFilepath((filepath) => import("./components/Plan").then((_) => _.plan(filepath)))
  )
}
