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

import type { OnData } from "../../../components/Dashboard/types.js"

import { WorkerState, states } from "./states.js"

/** A blinking lights demo that pumps random data into the UI */
export default class Demo {
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
