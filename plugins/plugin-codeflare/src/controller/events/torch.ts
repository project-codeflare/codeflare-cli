/*
 * Copyright 2022 The Kubernetes Authors
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

import Event from "./Event"

type EventType = "Epoch" | "Iteration" | "Marker"
type Detail = { epoch: number; step: number; nSteps: number; ip: string }
type TorchEvent = Event<EventType, Detail>

function findPrevious(M: TorchEvent[], ip: TorchEvent["ip"], type: EventType) {
  for (let idx = M.length - 1; idx >= 0; idx--) {
    const evt = M[idx]
    if (evt.type === type && evt.ip === ip) {
      return evt
    }
  }
}

function findEpoch(M: TorchEvent[], ip: TorchEvent["ip"]) {
  const evt = findPrevious(M, ip, "Epoch")
  return evt ? evt.step : -1
}

function collateEvent(M: TorchEvent[], line: string) {
  const startMatch = line.match(/ip=([\d.]+)\)\s+(\d+\/\d+\/\d+\s+\d+:\d+:\d+)\s+.+\*\*\*\*\* Running training/)
  if (startMatch) {
    const ip = startMatch[1]
    const type = "Marker"
    const name = type
    const message = type
    const hidden = true
    const timestamp = new Date(startMatch[2]).getTime()
    const epoch = -1
    const step = -1
    const nSteps = -1
    const state = "InProgress"
    M.push({ ip, name, message, state, type, hidden, timestamp, epoch, step, nSteps })
    return M
  }

  const match = line.match(/ip=([\d.]+)\)\s+(Epoch|Iteration):\s+(\d+)%\|[^|]+\|\s(\d+)\/(\d+)/)
  if (match) {
    const ip = match[1]
    const type = match[2] as EventType
    // const percentage = parseInt(match[3], 10)
    const step = parseInt(match[4], 10)
    const nSteps = parseInt(match[5], 10)

    const epoch = type === "Epoch" ? step : findEpoch(M, ip)
    const timestampMarker = findPrevious(M, ip, "Marker")

    const event = {
      name: `Torch Training on ${ip}`,
      message: `Epoch ${epoch}${type !== "Epoch" ? ` - ${type} ${step}` : ""} of ${nSteps}`,
      ip,
      type,
      step,
      nSteps,
      epoch,
      timestamp: timestampMarker ? timestampMarker.timestamp : Date.now(),
      state: "InProgress" as const,
    }

    // find previous by ip and mark it Done
    const prev = findPrevious(M, ip, type)
    if (prev) {
      prev.state = "Done"

      if (type === "Epoch" && prev.step === step) {
        // strange, torch seems to repeat the e.g. Epoch 6/6 event...
        return M
      }
    }

    M.push(event)
  }

  return M
}

function sortFn(a: TorchEvent, b: TorchEvent) {
  return a.ip.localeCompare(b.ip) || a.epoch - b.epoch || a.step - b.step || a.type.localeCompare(b.type)
}

/** @return lifecycle events (Epoch, Iteration) for Torch training */
export default function torchEvents(jobLogs: string): TorchEvent[] {
  return jobLogs
    .split(/\n/)
    .reduce(collateEvent, [] as TorchEvent[])
    .sort(sortFn)
}
