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

import React from "react"
import { join } from "path"
import stripAnsi from "strip-ansi"
import { Arguments } from "@kui-shell/core"

import parseKubeEvents, { collateEvent as collateKubeEvent, KubeEvent } from "./kube"
import parseTorchEvents, { collateEvent as collateTorchEvent, TorchEvent } from "./torch"

import { expand } from "../../lib/util"
import Grid from "../../components/Grid"

interface EventState {
  kubeEvents: KubeEvent[]
  torchEvents: TorchEvent[]
}

type State = EventState & {
  nKubeEvents: number
  nTorchEvents: number
  catastrophicError?: Error
}

type Props = EventState & {
  /** Follow kube events? */
  onKube?(eventType: "data", cb: (data: any) => void): void

  /** Follow torch events? */
  onTorch?(eventType: "data", cb: (data: any) => void): void

  /** Stop watching? */
  unwatch?(): void
}

class Events extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)

    const kubeEvents = props.kubeEvents || []
    const torchEvents = props.torchEvents || []
    this.state = {
      kubeEvents,
      torchEvents,
      nKubeEvents: kubeEvents.length,
      nTorchEvents: torchEvents.length,
    }

    // reduce any initial flood of events
    let queueFlushHysteresis = 300
    setTimeout(() => (queueFlushHysteresis = 0), 5000)

    if (props.onKube) {
      let queue: string[] = []
      let flushTO: ReturnType<typeof setTimeout>

      props.onKube("data", (line) => {
        if (typeof line === "string") {
          queue.push(stripAnsi(line))

          if (flushTO) {
            clearTimeout(flushTO)
          }

          flushTO = setTimeout(() => {
            const toBeProcessed = queue
            queue = []
            this.setState((curState) => {
              toBeProcessed.forEach((line) => collateKubeEvent(curState.kubeEvents, line))
              return {
                nKubeEvents: curState.kubeEvents.length,
              }
            })
          }, queueFlushHysteresis)
        }
      })
    }
    if (props.onTorch) {
      let queue: string[] = []
      let flushTO: ReturnType<typeof setTimeout>

      props.onTorch("data", (line) => {
        if (typeof line === "string") {
          queue.push(stripAnsi(line))

          if (flushTO) {
            clearTimeout(flushTO)
          }

          flushTO = setTimeout(() => {
            const toBeProcessed = queue
            queue = []
            this.setState((curState) => {
              toBeProcessed.forEach((line) => collateTorchEvent(curState.torchEvents, line))
              return {
                nTorchEvents: curState.torchEvents.length,
              }
            })
          }, queueFlushHysteresis)
        }
      })
    }
  }

  public static getDerivedStateFromError(error: Error) {
    return { catastrophicError: error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("catastrophic error in Scalar", error, errorInfo)
  }

  public componentWillUnmount() {
    if (this.props.unwatch) {
      this.props.unwatch()
    }
  }

  private get events() {
    return [...this.state.kubeEvents, ...this.state.torchEvents]
      .filter((_) => !_.hidden)
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  public render() {
    if (this.state.catastrophicError) {
      return "Internal Error"
    } else {
      return <Grid events={this.events} />
    }
  }
}

async function eventsUI(filepath: string, REPL: Arguments["REPL"]) {
  const jobFilepath = join(expand(filepath), "logs/job.txt")
  const kubeFilepath = join(expand(filepath), "events/kubernetes.txt")

  if (process.env.FOLLOW) {
    const [TailFile, split2] = await Promise.all([
      import("@logdna/tail-file").then((_) => _.default),
      import("split2").then((_) => _.default),
    ])

    const kubeTail = new TailFile(kubeFilepath, {
      startPos: 0,
      pollFileIntervalMs: 500,
    })
    kubeTail.on("tail_error", (err) => {
      console.error(err)
    })

    const jobTail = new TailFile(jobFilepath, {
      startPos: 0,
      pollFileIntervalMs: 500,
    })
    jobTail.on("tail_error", (err) => {
      console.error(err)
    })

    kubeTail.start()
    jobTail.start()

    const kubeSplitter = kubeTail.pipe(split2())
    const torchSplitter = jobTail.pipe(split2())

    return (
      <Events
        kubeEvents={[]}
        torchEvents={[]}
        onKube={kubeSplitter.on.bind(kubeSplitter)}
        onTorch={torchSplitter.on.bind(torchSplitter)}
        unwatch={() => {
          kubeTail.quit()
          jobTail.quit()
        }}
      />
    )
  } else {
    const [kube, torch] = await Promise.all([
      REPL.qexec<string>(`vfs fslice ${kubeFilepath} 0`).then(stripAnsi).then(parseKubeEvents),
      REPL.qexec<string>(`vfs fslice ${jobFilepath} 0`).then(stripAnsi).then(parseTorchEvents),
    ])

    return <Events kubeEvents={kube} torchEvents={torch} />
  }
}

export default async function eventsCmd(args: Arguments) {
  const filepath = args.argvNoOptions[2]
  if (!filepath) {
    throw new Error(`Usage chart progress ${filepath}`)
  }

  return {
    react: await eventsUI(expand(filepath), args.REPL),
  }
}
