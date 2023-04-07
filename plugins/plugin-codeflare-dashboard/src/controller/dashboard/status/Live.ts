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

import Heap from "heap"
import stripAnsi from "strip-ansi"
import type { TextProps } from "ink"

import type Options from "../options.js"
import type { Tail } from "../tailf.js"
import type HistoryConfig from "../history.js"
import type { WorkerState } from "./states.js"
import type { OnData, Worker } from "../../../components/Dashboard/types.js"

import { rankFor, stateFor } from "./states.js"

type Line = { line: string; stateRank: number; timestamp: number }

/**
 * Maintain a model of live data from a given set of file streams
 * (`tails`), and pump it into the given `cb` callback.
 *
 */
export default class Live {
  /** Model of status per worker */
  private readonly workers: Record<string, Worker> = {}

  /** Number of lines of output to retain. TODO this depends on height of terminal? */
  private static readonly MAX_HEAP = 1000

  /** Model of the lines of output */
  private readonly lines = new Heap<Line>((a, b) => {
    if (a.line === b.line) {
      return a.timestamp - b.timestamp
    }

    const stateDiff = b.stateRank - a.stateRank
    if (stateDiff !== 0) {
      return stateDiff
    } else {
      return a.timestamp - b.timestamp
    }
  })

  public constructor(
    historyConfig: HistoryConfig,
    private readonly tails: Promise<Tail>[],
    cb: OnData,
    styleOf: Record<WorkerState, TextProps>,
    private readonly opts: Pick<Options, "lines">
  ) {
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
              // this.pushLineAndPublish(data, metric, timestamp, cb)
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
                    metricHistory: [],
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
                  lines: this.pushLine(data, metric, timestamp),
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

  private readonly lookup: Record<string, Line> = {}
  /** Add `line` to our circular buffer `this.lines` */
  private pushLine(line: string, metric: WorkerState, timestamp: number) {
    const key = line
      .replace(/\s*(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z)\s*/, "{timestamp}")
      .replace(/pod\/torchx-\S+ /, "") // worker name in torchx
      .replace(/pod\/ray-(head|worker)-\S+ /, "") // worker name in ray
      .replace(/\* /, "") // wildcard worker name (codeflare)
      .replace(/\x1b\x5B\[2J/g, "") // eslint-disable-line no-control-regex
    // ^^^ [2J is part of clear screen; we don't want those to flow through

    const rec = {
      timestamp,
      stateRank: rankFor[metric],
      line: key,
    }

    const already = this.lookup[rec.line]
    if (already) {
      already.timestamp = timestamp
      this.lines.updateItem(already)
    } else {
      this.lookup[rec.line] = rec
      if (this.lines.size() >= Live.MAX_HEAP) {
        this.lines.replace(rec)
      } else {
        this.lines.push(rec)
      }
    }

    if (this.opts.lines === 0) {
      return []
    } else {
      return this.lines
        .toArray()
        .slice(0, this.opts.lines || 8)
        .sort((a, b) => a.timestamp - b.timestamp)
    }
  }

  /** `pushLine` and then pass the updated model to `cb` */
  private pushLineAndPublish(line: string, metric: WorkerState, timestamp: number, cb: OnData) {
    cb({ lines: this.pushLine(line, metric, timestamp), workers: Object.values(this.workers) })
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
