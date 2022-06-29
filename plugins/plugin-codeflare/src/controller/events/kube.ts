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

type EventType = "Pulling" | "Pulled"
type KubeEvent = Event<EventType, { node: string }>

function findPrevious(M: KubeEvent[], node: KubeEvent["node"], type: EventType) {
  for (let idx = M.length - 1; idx >= 0; idx--) {
    const evt = M[idx]
    if (evt.type === type && evt.node === node) {
      return evt
    }
  }
}

function collateEvent(M: KubeEvent[], line: string) {
  const pullMatch = line.match(/(Pulling|Pulled)\s+(\S+)\s+(.+)$/)
  if (pullMatch) {
    const type = pullMatch[1] as EventType
    const node = pullMatch[2]
    const message = pullMatch[3]
    const state = type === "Pulling" ? "InProgress" : "Done"

    if (type === "Pulled") {
      const pulling = findPrevious(M, node, "Pulling")
      if (pulling) {
        pulling.state = "Done"
      }
    } else {
      M.push({
        name: "Pulling base image",
        subtitle: node,
        node,
        type,
        message,
        state,
        timestamp: -1,
      })
    }
  }

  return M
}

/** @return lifecycle events from Kubernetes */
export default function kubeEvents(kubeEvents: string): KubeEvent[] {
  return kubeEvents.split(/\n/).reduce(collateEvent, [] as KubeEvent[])
}
