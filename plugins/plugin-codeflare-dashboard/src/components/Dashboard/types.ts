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

export type Worker = {
  /** Identifier of this worker */
  name: string

  /** Current metric value */
  metric: string

  /** Color for grid cell and legend */
  style: TextProps

  /** millis since epoch of the first update */
  firstUpdate: number

  /** millis since epoch of the last update */
  lastUpdate: number
}

/** Updated info from controller */
export type UpdatePayload = {
  /** Per-worker status info */
  workers: Worker[]

  /** Lines of raw output to be displayed */
  lines?: { lines: string[]; idx: number; N: number }
}

/** Callback from controller when it has updated data */
export type OnData = (payload: UpdatePayload) => void

export type GridSpec = {
  /** title of grid */
  title: string

  /** Names for distinct states */
  states: { state: string; style: TextProps }[]

  /** Init updater that returns a cancellation function */
  initWatcher(cb: OnData): { quit: () => void }
}
