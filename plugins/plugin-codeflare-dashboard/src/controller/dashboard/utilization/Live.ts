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

import stripAnsi from "strip-ansi"
import type { TextProps } from "ink"

import type { Tail } from "../tailf.js"
import type { WorkerState } from "./states.js"
import type HistoryConfig from "../history.js"
import type { OnData, Worker } from "../../../components/Dashboard/types.js"

import { states } from "./states.js"
import { update as updateHistory } from "../history.js"

/**
 * Maintain a model of live data from a given set of file streams
 * (`tails`), and pump it into the given `cb` callback.
 *
 */
export default class Live {
  /** Model of status per worker */
  private readonly workers: Record<string, Worker> = {}

  /**
   * Map a [0,100] number-as-string to a `metricIdx`, which is an
   * index into the `states` array, and also return the parsed integer
   * `value`.
   */
  private stateFor(util: string) {
    const value = parseInt(util.replace(/%$/, ""), 10)
    const bucketWidth = ~~(100 / states.length)
    const metricIdx = Math.min(~~(value / bucketWidth), states.length - 1)

    return { metricIdx, value }
  }

  public constructor(
    historyConfig: HistoryConfig,
    expectedProvider: string,
    private readonly tails: Promise<null | Tail>[],
    cb: OnData,
    styleOf: Record<WorkerState, TextProps>
  ) {
    tails.map((tailf) => {
      tailf.then((tail) => {
        if (tail) {
          // async here to improve interleaving (i.e. the async is used
          // to introduce a thread yield), not because we have anything
          // inherently asynchronous to do
          tail.stream.on("data", async (data) => {
            if (data) {
              const line = stripAnsi(data)
              const cols = line.split(/\s+/)

              // worker name
              const name = cols[3] ? cols[3].trim() : undefined

              const rawTimestamp = cols[cols.length - 1]
              const timestamp = this.asMillisSinceEpoch(rawTimestamp)

              // e.g. CPU Utilization
              const provider = (!cols[0] ? undefined : cols[0].replace(/^\[/, "")) + (cols[1] ? " " + cols[1] : "")
              if (provider !== expectedProvider) {
                return
              }

              // 50%, 100% utilization
              const percentStr = !cols[2] ? undefined : cols[2].replace(/\]$/, "")
              if (!provider || !percentStr) {
                // ignore this line
                return
              }

              // cast the percentStr into a metricIdx, i.e. index into our quantized `states`
              const { metricIdx, value } = this.stateFor(percentStr)
              const metric = states[metricIdx]

              if (!name || !timestamp) {
                // console.error("Bad status record", line)
                return
              } else if (!/^pod\//.test(name) || /cleaner/.test(name)) {
                // only track pod events, and ignore our custodial pods
                return
              } else {
                const update = (name: string) => {
                  if (!this.workers[name]) {
                    // never seen this named worker before
                    this.workers[name] = {
                      name,
                      metric,
                      metricHistory: updateHistory(value, metricIdx, timestamp, historyConfig),
                      firstUpdate: timestamp,
                      lastUpdate: timestamp,
                      style: styleOf[metric],
                    }
                  } else if (this.workers[name].lastUpdate <= timestamp) {
                    // we have seen it before, update the metric value and
                    // timestamp; note that we only update the model if our
                    // timestamp is after the lastUpdate for this worker
                    this.workers[name].metric = metric
                    this.workers[name].lastUpdate = timestamp
                    this.workers[name].style = styleOf[metric]
                    this.workers[name].metricHistory = updateHistory(
                      value,
                      metricIdx,
                      timestamp,
                      historyConfig,
                      this.workers[name].metricHistory
                    )
                  } else {
                    // out of date event, drop it
                    return
                  }
                }

                if (name === "*") {
                  // this event affects every worker
                  Object.keys(this.workers).forEach(update)
                } else {
                  // this event affects a specific worker
                  update(name)
                }

                // inform the UI that we have updates
                cb({
                  workers: Object.values(this.workers),
                })
              }
            }
          })
        }
      })
    })
  }

  private asMillisSinceEpoch(timestamp: string) {
    try {
      return new Date(timestamp).getTime()
    } catch (err) {
      // caller must check for undefined and handle error accordingly
      return undefined
    }
  }

  public async quit() {
    await Promise.all(
      this.tails.map(async (_) => {
        try {
          const tail = await _
          if (tail) {
            return tail.quit()
          }
        } catch (err) {
          // error initializing tailf, probably doesn't matter now that
          // we're cleaning up
        }
      })
    )
  }
}
