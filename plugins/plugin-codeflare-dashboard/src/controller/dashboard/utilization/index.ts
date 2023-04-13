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

import type Kind from "../kinds.js"
import type { Tail } from "../tailf.js"
import type Options from "../options.js"
import type HistoryConfig from "../history.js"
import type { WorkerState } from "./states.js"
import type { OnData, GridSpec } from "../../../components/Job/types.js"
import { SupportedUtilizationGrid, defaultUtilizationThemes, providerFor } from "../grids.js"

import { states } from "./states.js"
import { isValidTheme, themes } from "./theme.js"

import Demo from "./Demo.js"
import Live from "./Live.js"

/** foo => Foo; fOO => Foo; FOO => Foo */
function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase()
}

/** Displayed variant of `Kind` */
function titleFor(kind: Kind) {
  return capitalize(kind).replace(/(.*)mem/i, (_, p1) => p1 + (!p1 ? "" : " ") + "Memory")
}

export default function utilizationDashboard(
  kind: SupportedUtilizationGrid,
  tails: Promise<null | Tail>[],
  historyConfig: HistoryConfig,
  opts: Pick<Options, "demo">
): GridSpec {
  const themeS = defaultUtilizationThemes[kind]
  if (!isValidTheme(themeS)) {
    throw new Error("Invalid theme: " + themeS)
  }

  const theme = themes[themeS]

  const styleOf = theme.reduce((M, t, idx) => {
    M[states[idx]] = t
    return M
  }, {} as Record<WorkerState, TextProps>)

  const initWatcher = (cb: OnData) => {
    if (opts.demo) {
      return new Demo(historyConfig, cb, styleOf)
    } else {
      const expectedProvider = providerFor[kind]
      return new Live(historyConfig, expectedProvider, tails, cb, styleOf)
    }
  }

  const styledStates = states.map((state) => ({ state, style: styleOf[state] }))
  return { title: titleFor(kind), isQualitative: false, initWatcher, states: styledStates }
}
