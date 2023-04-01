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
import type { OnData, Worker } from "../../../components/Dashboard/types.js"

import { WorkerState, stateFor } from "./states.js"

/**
 * Maintain a model of live data from a given set of file streams
 * (`tails`), and pump it into the given `cb` callback.
 *
 */
export default class Live {
  /** Model of status per worker */
  private readonly workers: Record<string, Worker> = {}

  /** Number of lines of output to retain. TODO this depends on height of terminal? */
  private static readonly nLines = 18

  /** Model of the last `Live.nLines` lines of output */
  private readonly lines: string[] = Array(Live.nLines).fill("")

  /** Current insertion index into `this.lines` */
  private linesInsertionIdx = 0

  /** Current number of valid lines in `this.lines` */
  private linesCount = 0

  public constructor(private readonly tails: Promise<Tail>[], cb: OnData, styleOf: Record<WorkerState, TextProps>) {
    tails.map((tailf) => {
      tailf.then(({ stream }) => {
        stream.on("data", (data) => {
          if (data) {
            const line = stripAnsi(data)
            const cols = line.split(/\s+/)

            const provider = !cols[0] ? undefined : cols[0].replace(/^\[/, "")
            const key = !cols[1] ? undefined : cols[1].replace(/\]$/, "")
            const fullKey = (provider || "") + "_" + (key || "")
            const metric = !provider || !key ? undefined : stateFor[fullKey] || stateFor[key]
            const name = cols[2] ? cols[2].trim() : undefined
            const timestamp = this.asMillisSinceEpoch(cols[cols.length - 1])

            if (!name || !timestamp) {
              // console.error("Bad status record", line)
              this.pushLineAndPublish(data, cb)
              return
            } else if (!metric) {
              // ignoring this line
              return
            } else if (provider === "Workers" && (!/^pod\//.test(name) || /cleaner/.test(name))) {
              // only track pod events, and ignore our custodial pods
              return
            } else {
              const update = (name: string) => {
                if (!this.workers[name]) {
                  // never seen this named worker before
                  this.workers[name] = {
                    name,
                    metric,
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
                } else {
                  // out of date event, drop it
                  return
                }

                // inform the UI that we have updates
                cb({
                  lines: this.pushLine(data),
                  workers: Object.values(this.workers),
                })
              }

              if (name === "*") {
                // this event affects every worker
                Object.keys(this.workers).forEach(update)
              } else {
                // this event affects a specific worker
                update(name)
              }
            }
          }
        })
      })
    })
  }

  /** Add `line` to our circular buffer `this.lines` */
  private pushLine(line: string) {
    if (this.lines.includes(line)) {
      // duplicate line
      // the oldest is the one we are about to overwrite
      let oldestIdx = this.linesInsertionIdx
      if (this.lines[oldestIdx].length === 0) {
        do {
          oldestIdx = (oldestIdx + 1) % Live.nLines
        } while (this.lines[oldestIdx].length === 0)
      }
      return { lines: this.lines, idx: oldestIdx, N: this.linesCount }
    } else {
      const idx = this.linesInsertionIdx
      this.linesInsertionIdx = (this.linesInsertionIdx + 1) % Live.nLines

      this.lines[idx] = line
      this.linesCount = Math.min(this.lines.length, this.linesCount + 1)

      // the oldest is the one we are about to overwrite
      let oldestIdx = this.linesInsertionIdx
      if (this.lines[oldestIdx].length === 0) {
        do {
          oldestIdx = (oldestIdx + 1) % Live.nLines
        } while (this.lines[oldestIdx].length === 0)
      }

      return { lines: this.lines, idx: oldestIdx, N: this.linesCount }
    }
  }

  /** `pushLine` and then pass the updated model to `cb` */
  private pushLineAndPublish(line: string, cb: OnData) {
    cb({ lines: this.pushLine(line), workers: Object.values(this.workers) })
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
          return tail.quit()
        } catch (err) {
          // error initializing tailf, probably doesn't matter now that
          // we're cleaning up
        }
      })
    )
  }
}
