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
export type TorchEvent = Event<EventType, Detail>

function findPrevious(
  M: TorchEvent[],
  ip: TorchEvent["ip"],
  type: EventType,
  state: TorchEvent["state"],
  step = -1,
  epoch = -1
) {
  for (let idx = M.length - 1; idx >= 0; idx--) {
    const evt = M[idx]
    if (
      evt.type === type &&
      evt.ip === ip &&
      evt.state === state &&
      (step === -1 || evt.step === step) &&
      (epoch === -1 || evt.epoch === epoch)
    ) {
      return evt
    }
  }
}

function findEpoch(M: TorchEvent[], ip: TorchEvent["ip"], state: TorchEvent["state"] = "InProgress", step?: number) {
  return findPrevious(M, ip, "Epoch", state, step)
}

class TorchEventImpl implements TorchEvent {
  public constructor(
    public readonly name: string,
    public readonly ip: string,
    public readonly type: EventType,
    public readonly step: number,
    public readonly nSteps: number,
    public readonly epoch: number,
    public readonly timestamp: number,
    public state: TorchEvent["state"] = "InProgress",
    public readonly message = `Epoch ${epoch}${type !== "Epoch" ? ` - ${type} ${step}` : ""} of ${nSteps}`
  ) {}
}

export function collateEvent(M: TorchEvent[], line: string) {
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
    const state = "Done"
    M.push({ ip, name, message, state, type, hidden, timestamp, epoch, step, nSteps })
    return M
  }

  const match = line.match(/ip=([\d.]+)\)\s+(Epoch|Iteration):\s+(\d+)%\|[^|]+\|\s(\d+)\/(\d+)/)
  if (match) {
    const ip = match[1]
    const type = match[2] as EventType
    // const percentage = parseInt(match[3], 10)
    const step = parseInt(match[4], 10) - (type === "Epoch" ? 0 : 1)
    const nSteps = parseInt(match[5], 10)

    const epoch =
      type === "Epoch"
        ? { step, nSteps, state: "InProgress" }
        : findEpoch(M, ip) || { step: -1, nSteps: 0, state: "InProgress" }
    const name = `Torch Training on ${ip}`
    const timestampMarker = findPrevious(M, ip, "Marker", "Done")
    const timestamp = timestampMarker ? timestampMarker.timestamp : Date.now()

    if (type === "Iteration") {
      epoch.state = "InProgress"
    } else if (step > 0) {
      const thisEpoch = findEpoch(M, ip, "Pending", step)
      if (thisEpoch) {
        thisEpoch.state = "InProgress"
      }
    }

    // find previous by ip and mark it Done
    if (step > 0) {
      const prev =
        type === "Iteration"
          ? findPrevious(M, ip, type, "Pending", step - 1, epoch.step) // previous iteration in this epoch
          : findPrevious(M, ip, type, "InProgress", step - 1, epoch.step - 1) // previous epoch
      if (prev) {
        prev.state = "Done"
      } else if (type === "Iteration" && step === nSteps - 1) {
        // torch repeat the last step to indicate fully done
        const prev = findPrevious(M, ip, type, "Pending", nSteps - 1, epoch.step) // last iteration
        if (prev) {
          prev.state = "Done"
        }
      }
    }

    if (type === "Epoch" && step === 0) {
      // first Epoch
      M.push(new TorchEventImpl(name, ip, type, step, nSteps, epoch.step, timestamp))
    } else if (type === "Iteration" && step === 0 && epoch.step === 0) {
      // first Iteration of first Epoch: pre-fill the remaining Epochs and Iterations
      M.push(new TorchEventImpl(name, ip, type, step, nSteps, epoch.step, timestamp, "Pending"))

      // pre-fill remaining Iterations for epoch 0
      for (let iterIdx = 1; iterIdx < nSteps; iterIdx++) {
        M.push(new TorchEventImpl(name, ip, "Iteration", iterIdx, nSteps, 0, timestamp, "Pending"))
      }

      // now pre-fill the remaining Epochs
      for (let epochIdx = 1; epochIdx < epoch.nSteps; epochIdx++) {
        M.push(new TorchEventImpl(name, ip, "Epoch", epochIdx, epoch.nSteps, epochIdx, timestamp, "Pending"))
        for (let iterIdx = 1; iterIdx < nSteps; iterIdx++) {
          M.push(new TorchEventImpl(name, ip, "Iteration", iterIdx, nSteps, epochIdx, timestamp, "Pending"))
        }
      }
    }
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
