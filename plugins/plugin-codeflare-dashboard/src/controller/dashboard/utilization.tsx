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
import { isValidTheme, themes } from "./themes/utilization.js"
import { OnData, Worker, GridSpec } from "../../components/Dashboard/index.js"

type WorkerState = "0-20%" | "20-40%" | "40-60%" | "60-80%" | "80-100%"

const states: WorkerState[] = ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"]

/**
 * Maintain a model of live data from a given set of file streams
 * (`tails`), and pump it into the given `cb` callback.
 *
 */
class Live {
  /** Model of status per worker */
  private readonly workers: Record<string, Worker> = {}

  private stateFor(util: string): WorkerState {
    const percent = parseInt(util.replace(/%$/, ""), 10)
    const bucketWidth = ~~(100 / states.length)
    return states[~~(percent / bucketWidth)]
  }

  public constructor(private readonly tails: Promise<Tail>[], cb: OnData, styleOf: Record<WorkerState, TextProps>) {
    tails.map((tailf) => {
      tailf.then(({ stream }) => {
        stream.on("data", (data) => {
          if (data) {
            const line = stripAnsi(data)
            const cols = line.split(/\s+/)

            const provider = !cols[0] ? undefined : cols[0].replace(/^\[/, "")
            const key = !cols[2] ? undefined : cols[2].replace(/\]$/, "")
            const metric = !provider || !key ? undefined : this.stateFor(key)
            const name = cols[3] ? cols[3].trim() : undefined
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

function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1)
}

export default function utilizationDashboard(
  kind: "cpu" | "memory",
  tails: Promise<Tail>[],
  opts: Pick<Options, "demo" | "theme" | "themeDefault">
): GridSpec {
  const { theme: themeS = opts.themeDefault } = opts
  if (!isValidTheme(themeS)) {
    throw new Error("Invalid theme: " + themeS)
  }

  const theme = themes[themeS]

  const styleOf = theme.reduce((M, t, idx) => {
    M[states[idx]] = t
    return M
  }, {} as Record<WorkerState, TextProps>)

  const initWatcher = (cb: OnData) => {
    if (opts.demo) {
      return new Demo(cb, styleOf)
    } else {
      return new Live(tails, cb, styleOf)
    }
  }

  const styledStates = states.map((state) => ({ state, style: styleOf[state] }))
  return { title: capitalize(kind), initWatcher, states: styledStates }
}
