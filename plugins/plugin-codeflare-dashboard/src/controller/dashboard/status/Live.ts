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

type Event = { line: string; stateRank: number; timestamp: number }

/**
 * Keep track of a local timestamp so we can prioritize and show the
 * most recent; this is a "local" timestamp in that it does not
 * indicate when the event was created on the server, but rather when
 * we received it. Perhaps suboptimal, but we cannot guarantee that
 * random log lines from applications are timestamped.
 */
type LogLineRecord = { id: string; logLine: string; localMillis: number }

/**
 * Maintain a model of live data from a given set of file streams
 * (`tails`), and pump it into the given `cb` callback.
 *
 */
export default class Live {
  /** Model of status per worker */
  private readonly workers: Record<string, Worker> = {}

  /** Number of lines of event output to retain. TODO this depends on height of terminal? */
  private static readonly MAX_HEAP = 1000

  /** Model of logLines. TODO circular buffer and obey options.lines */
  private logLine: Record<string, LogLineRecord> = {}

  /** Model of the lines of output */
  private readonly events = new Heap<Event>((a, b) => {
    if (a.line === b.line) {
      return a.timestamp - b.timestamp
    }

    const stateDiff = a.stateRank - b.stateRank
    if (stateDiff !== 0) {
      return stateDiff
    } else {
      return a.timestamp - b.timestamp
    }
  })

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
                this.pushLineAndPublish(stripColors(data), cb)
              }

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
                    events: this.pushEvent(data, metric, timestamp),
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
        }
      })
    })
  }

  /** @return the most important events, to be shown in the UI */
  private importantEvents() {
    return this.events
      .toArray()
      .slice(0, this.opts.events || 8)
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  /** Replace any timestamps with a placeholder, so that the UI can use a "5m ago" style */
  private timestamped(line: string) {
    return line.replace(/\s*(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z)\s*/, "{timestamp}")
  }

  private readonly lookup: Record<string, Event> = {}
  /** Add `line` to our heap `this.events` */
  private pushEvent(line: string, metric: WorkerState, timestamp: number) {
    const key = this.timestamped(line)
      .replace(/pod\/torchx-\S+ /, "") // worker name in torchx
      .replace(/pod\/ray-(head|worker)-\S+ /, "") // worker name in ray
      .replace(/\* /, "") // wildcard worker name (codeflare)
      .replace(/\x1b\x5B\[2J/g, "") // eslint-disable-line no-control-regex
    // ^^^ [2J is part of clear screen; we don't want those to flow through

    const rec = {
      timestamp,
      stateRank: rankFor[metric],
      line: stripColors(key),
    }

    const already = this.lookup[rec.line]
    if (already) {
      already.timestamp = timestamp
      this.events.updateItem(already)
    } else {
      this.lookup[rec.line] = rec
      if (this.events.size() >= Live.MAX_HEAP) {
        this.events.replace(rec)
      } else {
        this.events.push(rec)
      }
    }

    if (this.opts.events === 0) {
      return []
    } else {
      return this.importantEvents()
    }
  }

  /** This helps us parse out a [W5] style prefix for loglines, so we can intuit the worker id of the log line */
  private readonly workerIdPattern = new RegExp("^(" + ansiRegex().source + ")?\\[([^\\]]+)\\]")

  private readonly timeSorter = (a: LogLineRecord, b: LogLineRecord): number => {
    return a.localMillis - b.localMillis
  }

  private readonly idSorter = (a: LogLineRecord, b: LogLineRecord): number => {
    return a.id.localeCompare(b.id)
  }

  /** Add the given `line` to our logLines model and pass the updated model to `cb` */
  private pushLineAndPublish(logLine: string, cb: OnData) {
    if (logLine) {
      // here we avoid a flood of React renders by batching them up a
      // bit; i thought react 18 was supposed to help with this. hmm.
      const match = logLine.match(this.workerIdPattern)
      const id = match ? match[2] : "notsure"
      if (id) {
        this.logLine[id] = { id, logLine, localMillis: Date.now() }

        // display the k most recent logLines per worker, ordering the display by worker id
        const k = 4
        cb({
          logLine: Object.values(this.logLine)
            .sort(this.timeSorter) // so we can pick off the most recent
            .slice(0, k) // now pick off the k most recent
            .sort(this.idSorter) // sort those k by worker id, so there is a consistent ordering in the UI
            .map((_) => _.logLine), // and display just the logLine
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
