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

/** Model of an individual worker on a job */
export type Worker = {
  /** Identifier of this worker */
  name: string

  /** Current metric value */
  metric: string

  /** History of metric values */
  metricHistory: { valueTotal: number; metricIdxTotal: number; N: number }[]

  /** Color for grid cell and legend */
  style: TextProps

  /** millis since epoch of the first update */
  firstUpdate: number

  /** millis since epoch of the last update */
  lastUpdate: number
}

export type LogLineUpdate = {
  /** Log lines */
  logLine: string[]
}

export type WorkersUpdate = {
  /** Per-worker status info */
  workers: Worker[]

  /** Lines of raw event lines to be displayed */
  events?: { line: string; timestamp: number }[]
}

/** Model that allows the controllers to pass updated `Worker` info */
export type UpdatePayload = LogLineUpdate | WorkersUpdate

export function isWorkersUpdate(update: UpdatePayload): update is WorkersUpdate {
  return Array.isArray((update as WorkersUpdate).workers)
}

/** Callback from controller when it has updated data */
export type OnData = (payload: UpdatePayload) => void

/**
 * The controllers will populate this model for each of the grid/heat
 * map UIs.
 */
export type GridSpec = {
  /** title of grid */
  title: string

  /**
   * Is this metric not quantitative? If not, it will not be shown in
   * average/temporal views, as it is not meaningful to compute the
   * average of a qualitative metric.
   */
  isQualitative: boolean

  /** Names for distinct states */
  states: { state: string; style: TextProps }[]

  /** Init updater that returns a cancellation function */
  initWatcher(cb: OnData): { quit: () => void }
}
