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

import type { Tail } from "./tailf.js"
import type Options from "./options.js"
import { OnData, Worker, GridSpec } from "../../components/Dashboard/index.js"
import { isValidStatusTheme, statusThemes } from "./themes/status.js"

type WorkerState = "Queued" | "Provisioning" | "Initializing" | "Running" | "Success" | "Failed"

const states: WorkerState[] = ["Queued", "Provisioning", "Initializing", "Running", "Success", "Failed"]

const stateFor: Record<string, WorkerState> = {
  Pending: "Queued",
  Queued: "Queued",
  Job_Pending: "Initializing", // this comes after the job is submitted, but probably preparing deps

  ContainerCreating: "Provisioning",
  SuccessfulCreate: "Provisioning",
  AddedInterface: "Provisioning",
  Created: "Provisioning",
  Scheduled: "Provisioning",

  Unhealthy: "Provisioning", // service not yet ready... Initializing?

  Initializing: "Initializing",
  Installing: "Initializing",
  Pulling: "Initializing",
  Pulled: "Initializing",

  Started: "Initializing",
  Workers_Running: "Initializing",

  Job_Running: "Running",

  Success: "Success",
  Succeeded: "Success",

  // ignore these
  // Workers_Terminating: "Success",
  // Workers_Killing: "Success",

  Failed: "Failed",
  FailedScheduling: "Failed",
  Workers_Evicted: "Failed",
}

/**
 * Maintain a model of live data from a given set of file streams
 * (`tails`), and pump it into the given `cb` callback.
 *
 */
class Live {
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

/** A blinking lights demo that pumps random data into the UI */
class Demo {
  private readonly interval: ReturnType<typeof setInterval>

  public constructor(cb: OnData, styleOf: Record<WorkerState, TextProps>) {
    const randoState = () => states[Math.round(Math.random() * states.length) % states.length]

    // the model, filled initially with random data
    let workers = Array(50)
      .fill(1)
      .map((_, idx) => {
        const metric = randoState()
        return { name: String(idx), metric, firstUpdate: Date.now(), lastUpdate: Date.now(), style: styleOf[metric] }
      })

    // initial callback to the UI
    cb({ workers })

    // periodically, change a random number of worker states, randomly
    this.interval = setInterval(() => {
      const nChanged = Math.max(1, Math.min(Math.floor(Math.random() * 8), workers.length))
      for (let idx = 0; idx < nChanged; idx++) {
        const metric = randoState()
        const idx = Math.round(Math.random() * workers.length) % workers.length

        workers = [
          ...workers.slice(0, idx),
          Object.assign(workers[idx], { metric, lastUpdate: Date.now(), style: styleOf[metric] }),
          ...workers.slice(idx + 1),
        ]
      }

      // periodic callback to the UI
      cb({ workers })
    }, 1000)
  }

  public quit() {
    clearInterval(this.interval)
  }
}

export default function statusDashboard(
  tails: Promise<Tail>[],
  opts: Pick<Options, "demo" | "theme" | "themeDefault">
): GridSpec {
  const { theme: themeS = opts.themeDefault } = opts
  if (!isValidStatusTheme(themeS)) {
    throw new Error("Invalid theme: " + themeS)
  }

  const theme = statusThemes[themeS]

  const styleOf: Record<WorkerState, TextProps> = {
    Queued: theme[0],
    Provisioning: theme[1],
    Initializing: theme[2],
    Running: theme[3],
    Success: theme[4],
    Failed: theme[5],
  }

  const initWatcher = (cb: OnData) => {
    if (opts.demo) {
      return new Demo(cb, styleOf)
    } else {
      return new Live(tails, cb, styleOf)
    }
  }

  const styledStates = states.map((state) => ({ state, style: styleOf[state] }))
  return { title: "Worker Status", initWatcher, states: styledStates }
}
