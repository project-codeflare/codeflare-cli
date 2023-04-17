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

import type HistoryConfig from "../history.js"
import type { WorkerState } from "./states.js"
import type { OnData } from "../../../../components/Job/types.js"

import { states } from "./states.js"
import GenericDemo from "../generic/Demo.js"

/** A blinking lights demo that pumps random utilization data into the UI */
export default class Demo extends GenericDemo<WorkerState> {
  public constructor(historyConfig: HistoryConfig, cb: OnData, styleOf: Record<WorkerState, TextProps>) {
    super(states, false, historyConfig, cb, styleOf)
  }
}
