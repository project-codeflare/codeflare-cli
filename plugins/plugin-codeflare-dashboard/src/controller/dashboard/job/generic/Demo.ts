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
import type { OnData } from "../../../../components/Job/types.js"

import { update } from "../history.js"

/** A blinking lights demo that pumps random data into the UI */
export default abstract class GenericDemo<WorkerState extends string> {
  private readonly interval: ReturnType<typeof setInterval>

  private readonly updateFrequency = 1000
  private currentBias = Math.random()
  private currentInfluence = Math.random()

  private metricIdx(rnd: number) {
    return Math.round((rnd * (1 - this.currentBias) + this.currentInfluence * this.currentBias) % this.states.length)
  }

  private rando() {
    const rnd = Math.random() * this.states.length

    if (this.isQualitative) {
      const metricIdx = this.metricIdx(rnd)
      return { value: metricIdx, metricIdx }
    } else {
      const bucketWidth = ~~(100 / this.states.length)
      const value = rnd * bucketWidth
      const metricIdx = this.metricIdx(rnd)
      return { value, metricIdx }
    }
  }

  protected constructor(
    private readonly states: WorkerState[],
    private readonly isQualitative: boolean,
    historyConfig: HistoryConfig,
    cb: OnData,
    styleOf: Record<WorkerState, TextProps>
  ) {
    // periodically adjust the bias
    setInterval(() => {
      this.currentBias = Math.random()
      this.currentInfluence = Math.random()
    }, 5 * this.updateFrequency)

    // the model, filled initially with random data
    let workers = Array(50)
      .fill(1)
      .map((_, idx) => {
        const { value, metricIdx } = this.rando()
        const metric = this.states[metricIdx]
        const now = Date.now()

        return {
          name: String(idx),
          metric,
          metricHistory: update(value, metricIdx, now, historyConfig),
          firstUpdate: now,
          lastUpdate: now,
          style: styleOf[metric],
        }
      })

    // initial callback to the UI
    cb({ workers })

    // periodically, change a random number of worker states, randomly
    this.interval = setInterval(() => {
      const nChanged = Math.max(1, Math.min(Math.floor(Math.random() * 8), workers.length))
      for (let idx = 0; idx < nChanged; idx++) {
        const idx = Math.round(Math.random() * workers.length) % workers.length // worker idx to update
        const { value, metricIdx } = this.rando()
        const metric = this.states[metricIdx]
        const now = Date.now()
        const metricHistory = update(value, metricIdx, now, historyConfig, workers[idx].metricHistory)

        workers = [
          ...workers.slice(0, idx),
          Object.assign(workers[idx], { metric, metricHistory, lastUpdate: now, style: styleOf[metric] }),
          ...workers.slice(idx + 1),
        ]
      }

      // periodic callback to the UI
      cb({ workers })
    }, this.updateFrequency)
  }

  public quit() {
    clearInterval(this.interval)
  }
}
