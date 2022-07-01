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
import stripAnsi from "strip-ansi"

import { toHostMap } from "../controller/charts/LogRecord"
import { timeRange } from "../controller/charts/timestamps"
import { nLinesPerGPURecord, parseRecord as parseGpuRecord, Log as GpuLog } from "../controller/charts/gpu"
import { filter as filterCpuLine, parseLine as parseCpuLine, Log as CpuLog } from "../controller/charts/vmstat"

import GPUChart from "./GPUChart"
import VmstatChart from "./VmstatChart"

interface Props {
  /** GPU log records to display on initial render */
  initialGpuData?: GpuLog[]

  /** CPU log records to display on initial render */
  initialCpuData?: CpuLog[]

  /** Follow gpu events? */
  onGpu?(eventType: "data", cb: (data: any) => void): void

  /** Follow cpu events? */
  onCpu?(eventType: "data", cb: (data: any) => void): void

  /** Stop any file watchers */
  unwatch?(): void
}

interface State {
  /** Ouch, something bad happened during the render */
  catastrophicError?: Error

  /** To help with react updates, maintain the number of GPU records as a state variable */
  nGpuDataPoints: number

  /** To help with react updates, maintain the number of CPU records as a state variable */
  nCpuDataPoints: number

  /** The GPU records */
  gpuData: GpuLog[]

  /** The CPU records */
  cpuData: CpuLog[]
}

/** Combined GPU/CPU chart set that interleaves (GPU,CPU) for each node */
export default class Combo extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)

    const gpuData = props.initialGpuData || []
    const cpuData = props.initialCpuData || []
    this.state = {
      gpuData,
      cpuData,
      nGpuDataPoints: gpuData.length,
      nCpuDataPoints: cpuData.length,
    }

    // reduce any initial flood of events
    let queueFlushHysteresis = 200
    setTimeout(() => (queueFlushHysteresis = 0), 2000)

    if (props.onGpu) {
      let queue: string[] = []
      let flushTO: ReturnType<typeof setTimeout>

      props.onGpu("data", (line) => {
        if (typeof line === "string") {
          queue.push(stripAnsi(line))
          if (flushTO) {
            clearTimeout(flushTO)
          }

          flushTO = setTimeout(() => {
            let nNewRecords = 0
            let idx = queue.findIndex((_) => _.length > 0)
            while (idx < queue.length) {
              const record = parseGpuRecord(queue.slice(idx, idx + nLinesPerGPURecord))
              this.state.gpuData.push(record)
              nNewRecords++
              idx += nLinesPerGPURecord + 1
            }

            queue = queue.slice(idx)
            this.setState((curState) => ({
              nGpuDataPoints: curState.nGpuDataPoints + nNewRecords,
            }))
          }, queueFlushHysteresis)
        }
      })
    }

    if (props.onCpu) {
      let queue: string[] = []
      let flushTO: ReturnType<typeof setTimeout>

      props.onCpu("data", (line) => {
        if (typeof line === "string" && filterCpuLine(line)) {
          queue.push(line)
          if (flushTO) {
            clearTimeout(flushTO)
          }

          flushTO = setTimeout(() => {
            queue.forEach((line) => this.state.cpuData.push(parseCpuLine(line)))
            const N = queue.length
            queue = []
            this.setState((curState) => ({
              nCpuDataPoints: curState.nCpuDataPoints + N,
            }))
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

  /** Oops, sometimes we have no data for a give node */
  private static noData(node: string, kind: "CPU Utilization" | "GPU Utilization", idx: number) {
    return (
      <div key={`nodata-${kind}-${idx}`} className="flex-layout" title={`No ${kind} for ${node}`}>
        <span className="flex-fill flex-layout flex-align-center">no data</span>
      </div>
    )
  }

  public charts() {
    // get a canonical list of nodes
    const gpuMap = toHostMap(this.state.gpuData)
    const cpuMap = toHostMap(this.state.cpuData)
    const nodes = Array.from(new Set(Object.keys(gpuMap).concat(Object.keys(cpuMap)))).sort((a, b) => {
      // sort them so that nodes for which we have both gpu and cpu
      // data float to the top; in second place will be the group of
      // nodes for which we have only gpu data; in last place will be
      // the nodes for which we only have cpu data
      const aHasG = gpuMap[a]
      const aHasC = cpuMap[a]
      const bHasG = gpuMap[b]
      const bHasC = cpuMap[b]

      // 2 vs 1 to get the gpu-first priority described above
      const vA = (aHasG ? 2 : 0) + (aHasC ? 1 : 0)
      const vB = (bHasG ? 2 : 0) + (bHasC ? 1 : 0)
      return vB - vA
    })

    // find the time range that spans both charts
    const range = timeRange(this.state.gpuData, this.state.cpuData)

    // interleave the gpu and cpu charts for given node, i.e. [n1gpu,
    // n2cpu, n2gpu, n2cpu, ...]. Display "no data" for the places we
    // lack either kind of data for a given node
    return nodes.flatMap((node, idx) => {
      // here, we make a (gpu, cpu) pair; we will flatMap these pairs
      // into the desired linear array
      const gpuForNode = gpuMap[node]
      const cpuForNode = cpuMap[node]

      // force render if time range changes; e.g. no updates for
      // gpu, but we got an update to cpu that changes the time
      // range
      const baseKey = `${node}-${range.min}-${range.max}`

      return [
        !gpuForNode ? (
          Combo.noData(node, "GPU Utilization", idx) // no gpu data for this node!
        ) : (
          <GPUChart
            key={`gpu-${gpuForNode.length}-${baseKey}`}
            minTime={range.min}
            maxTime={range.max}
            logs={{ [node]: gpuForNode }}
          />
        ),
        !cpuForNode ? (
          Combo.noData(node, "CPU Utilization", idx) // no cpu data for this node!
        ) : (
          <VmstatChart
            key={`cpu-${cpuForNode.length}-${baseKey}`}
            minTime={range.min}
            maxTime={range.max}
            logs={{ [node]: cpuForNode }}
          />
        ),
      ]
    })
  }

  public render() {
    if (this.state.catastrophicError) {
      return "InternalError"
    } else {
      return <div className="codeflare-chart-grid flex-fill">{this.charts()}</div>
    }
  }
}
