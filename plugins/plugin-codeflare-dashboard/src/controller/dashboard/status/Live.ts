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

import chalk from "chalk"
import ansiRegex from "ansi-regex"
import stripAnsi from "strip-ansi"
import type { TextProps } from "ink"

import stripColors from "../stripColors.js"
import type Options from "../options.js"
import type { Tail } from "../tailf.js"
import type HistoryConfig from "../history.js"
import type { WorkerState } from "./states.js"
import type { OnData, Worker } from "../../../components/Dashboard/types.js"

import { rankFor, stateFor } from "./states.js"

type Lined = { line: string }
type Timestamped = { timestamp: number }
type Identified<T extends number | string> = { id: T }

/** Event record */
type Event = Identified<number> & Timestamped & Lined & { stateRank: number }

/**
 * Keep track of a local timestamp so we can prioritize and show the
 * most recent; this is a "local" timestamp in that it does not
 * indicate when the event was created on the server, but rather when
 * we received it. Perhaps suboptimal, but we cannot guarantee that
 * random log lines from applications are timestamped.
 */
type LogLineRecord = Identified<string> &
  Timestamped &
  Lined & {
    /** Keep track of whether we've already shown a "heartbeat" message for each worker */
    alreadySeenHeartbeat: boolean
  }

/**
 * Maintain a model of live data from a given set of file streams
 * (`tails`), and pump it into the given `cb` callback.
 *
 */
export default class Live {
  /** Give an ordinal identifier [0, numWorkers) to a worker name */
  private ordinals: Record<string, number> = {}

  /** Model of status per worker, indexed by the worker's ordinal */
  private readonly workers: Worker[] = []

  /** Number of lines of event output to retain. TODO this depends on height of terminal? */
  private static readonly MAX_HEAP = 1000

  /** Model of logLines */
  private logLine: Record<string, LogLineRecord> = {}

  /** Model of the lines of output, indexed by worker ordinal */
  private readonly events: Event[] = []

  public constructor(
    historyConfig: HistoryConfig,
    private readonly tails: Promise<null | Tail>[],
    cb: OnData,
    styleOf: Record<WorkerState, TextProps>,
    private readonly opts: Pick<Options, "events">
  ) {
    tails.map((tailf) => {
      tailf.then((tail) => {
        if (tail) {
          tail.stream.on("data", (data) => {
            if (data) {
              if (tail.kind === "logs") {
                // handle a log line
                this.pushLineAndPublish(data, cb)
                return
              }

              // otherwise, treat it as an event
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
                return
              } else if (!metric) {
                // ignoring this line
                return
              } else if (provider === "Workers" && (!/^pod\//.test(name) || /cleaner/.test(name))) {
                // only track pod events, and ignore our custodial pods
                return
              } else {
                const update = (name: string) => {
                  const ordinal = this.ordinalOf(name)

                  if (!this.workers[ordinal]) {
                    // never seen this named worker before
                    this.workers[ordinal] = {
                      name,
                      metric,
                      metricHistory: [],
                      firstUpdate: timestamp,
                      lastUpdate: timestamp,
                      style: styleOf[metric],
                    }
                  } else if (this.workers[ordinal].lastUpdate <= timestamp) {
                    // we have seen it before, update the metric value and
                    // timestamp; note that we only update the model if our
                    // timestamp is after the lastUpdate for this worker
                    this.workers[ordinal].metric = metric
                    this.workers[ordinal].lastUpdate = timestamp
                    this.workers[ordinal].style = styleOf[metric]
                  } else {
                    // out of date event, drop it
                    return
                  }

                  this.pushEvent(ordinal, data, metric, timestamp)
                }

                if (name === "*") {
                  // this event affects every worker
                  this.workers.forEach((_) => update(_.name))
                } else {
                  // this event affects a specific worker
                  update(name)
                }

                // inform the UI that we have updates
                cb({
                  events: this.importantEvents(),
                  workers: this.workers,
                })
              }
            }
          })
        }
      })
    })
  }

  /** Replace any timestamps with a placeholder, so that the UI can use a "5m ago" style */
  private timestamped(line: string) {
    return line.replace(/\s*(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z)\s*/, "{timestamp}")
  }

  /** Strip out the worker name from `line` */
  private stripWorkerName(line: string) {
    return line
      .replace(/pod\/\S+-torchx-\S+ /, "") // worker name in torchx
      .replace(/pod\/ray-(head|worker)-\S+ /, "") // worker name in ray
      .replace(/\* /, "") // wildcard worker name (codeflare)
  }

  private stripPageClear(line: string) {
    // eslint-disable-next-line no-control-regex
    return line.replace(/\x1b\x5B\[2J/g, "")
    // ^^^ [2J is part of clear screen; we don't want those to flow through
  }

  /** Strip off offending elements, such as certain ansi control characters */
  private prepareLineForUI(line: string) {
    return stripColors(this.stripPageClear(this.stripWorkerName(this.timestamped(line))))
  }

  /** Add `line` to our `this.model */
  private pushEvent(ordinal: number, rawLine: string, metric: WorkerState, timestamp: number) {
    const rec = {
      id: ordinal,
      timestamp,
      stateRank: rankFor[metric],
      line: this.ordinalPrefix(ordinal) + this.prepareLineForUI(rawLine),
    }

    this.events[ordinal] = rec
  }

  /** This helps us parse out a [W5] style prefix for loglines, so we can intuit the worker id of the log line */
  private readonly workerIdPattern = new RegExp("^(" + ansiRegex().source + ")?\\[([^\\]]+)\\]")

  /** @return the [0,numWorkers) ordinal for the given `workerName` */
  private ordinalOf(workerName: string): number {
    if (workerName in this.ordinals) {
      return this.ordinals[workerName]
    } else {
      return (this.ordinals[workerName] = Object.keys(this.ordinals).length)
    }
  }

  /** See if we already have extracted an ordinal in the logline */
  private ordinalFromLine(logLine: string) {
    const match = logLine.match(this.workerIdPattern)
    return match ? match[2] : "notsure"
  }

  /** @return a pretty signifier of a worker's ordinal */
  private ordinalPrefix(ordinal: number) {
    return chalk.bold.yellow(`[W${ordinal}] `)
  }

  private readonly timeSorter = (a: Timestamped, b: Timestamped): number => {
    return a.timestamp - b.timestamp
  }

  private readonly idSorterS = (a: Identified<string>, b: Identified<string>): number => {
    return a.id.localeCompare(b.id)
  }

  private readonly idSorterN = (a: Identified<number>, b: Identified<number>): number => {
    return a.id - b.id
  }

  /** @return the most important events, to be shown in the UI */
  private importantEvents() {
    if (this.opts.events === 0) {
      // user asked to show no events
      return []
    } else {
      const k = this.opts.events || 8
      return (
        this.events
          // .sort(this.timeSorter)
          .slice(0, k)
          .sort(this.idSorterN)
      )
    }
  }

  /** Add the given `line` to our logLines model and pass the updated model to `cb` */
  private pushLineAndPublish(logLine: string, cb: OnData) {
    if (logLine) {
      const id = this.ordinalFromLine(logLine)
      if (id) {
        const isHeartbeat = /Job is active/.test(logLine)
        const alreadySeenHeartbeat = this.logLine[id] && this.logLine[id].alreadySeenHeartbeat
        if (isHeartbeat && alreadySeenHeartbeat) {
          // don't repeat the point...
          return
        }

        const idx = logLine.lastIndexOf(" ")
        const timestamp = idx < 0 ? undefined : this.asMillisSinceEpoch(stripAnsi(logLine.slice(idx + 1)))
        this.logLine[id] = {
          id,
          line: this.prepareLineForUI(logLine),
          timestamp: timestamp || Date.now(),
          alreadySeenHeartbeat: alreadySeenHeartbeat || isHeartbeat,
        }

        // display the k most recent logLines per worker, ordering the display by worker id
        const k = 4
        cb({
          logLine: Object.values(this.logLine)
            .sort(this.timeSorter) // so we can pick off the most recent
            .slice(0, k) // now pick off the k most recent
            .sort(this.idSorterS), // sort those k by worker id, so there is a consistent ordering in the UI
        })
      }
    }
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
