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

import type { TextProps } from "ink"

import type { Tail } from "../tailf.js"
import type Options from "../options.js"
import type HistoryConfig from "../history.js"
import type { WorkerState } from "./states.js"
import type { OnData, GridSpec } from "../../../components/Dashboard/types.js"

import Demo from "./Demo.js"
import Live from "./Live.js"
import { states } from "./states.js"
import { isValidStatusTheme, statusThemes } from "./theme.js"

export default function statusDashboard(
  tails: Promise<Tail>[],
  historyConfig: HistoryConfig,
  opts: Pick<Options, "demo" | "theme"> & Partial<Pick<Options, "themeDefault">>
): GridSpec {
  const { theme: themeS = opts.themeDefault || "colorbrewer6" } = opts
  if (!isValidStatusTheme(themeS)) {
    throw new Error("Invalid theme: " + themeS)
  }

  const theme = statusThemes[themeS]

  const styleOf: Record<WorkerState, TextProps> = {
    Queued: theme[0],
    Provisioning: theme[1],
    Initializing: theme[2],
    Running: theme[3],
    Success: theme[4],
    Failed: theme[5],
  }

  const initWatcher = (cb: OnData) => {
    if (opts.demo) {
      return new Demo(historyConfig, cb, styleOf)
    } else {
      return new Live(historyConfig, tails, cb, styleOf)
    }
  }

  const styledStates = states.map((state) => ({ state, style: styleOf[state] }))
  return { title: "Worker Status", isQualitative: true, initWatcher, states: styledStates }
}
