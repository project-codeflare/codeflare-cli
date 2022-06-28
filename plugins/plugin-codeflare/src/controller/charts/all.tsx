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
import { Arguments } from "@kui-shell/core"

/** Oops, sometimes we have no data for a give node */
function noData(node: string, kind: "CPU Utilization" | "GPU Utilization") {
  return (
    <div className="flex-layout" title={`No ${kind} for ${node}`}>
      <span className="flex-fill flex-layout flex-align-center">no data</span>
    </div>
  )
}

/**
 * Render a combo chart that interleaves GPU utilization and CPU
 * utilization charts, so that the two (for a given node) are
 * side-by-side.
 *
 */
export default async function all(args: Arguments) {
  const filepath = args.argvNoOptions[2]
  if (!filepath) {
    return `Usage chart all ${filepath}`
  }

  // parse the data
  const [gpuData, cpuData] = await Promise.all([
    import("./gpu").then((_) => _.parse(join(filepath, "resources/gpu.txt"), args.REPL)),
    import("./vmstat").then((_) => _.parse(join(filepath, "resources/pod-vmstat.txt"), args.REPL)),
  ])

  // load the UI components
  const [GPUChart, VmstatChart] = await Promise.all([
    import("../../components/GPUChart").then((_) => _.default),
    import("../../components/VmstatChart").then((_) => _.default),
  ])

  // get a canonical list of nodes
  const nodes = Array.from(new Set(Object.keys(gpuData).concat(Object.keys(cpuData)))).sort((a, b) => {
    // sort them so that nodes for which we have both gpu and cpu
    // data float to the top; in second place will be the group of
    // nodes for which we have only gpu data; in last place will be
    // the nodes for which we only have cpu data
    const aHasG = gpuData[a]
    const aHasC = cpuData[a]
    const bHasG = gpuData[b]
    const bHasC = cpuData[b]

    // 2 vs 1 to get the gpu-first priority described above
    const vA = (aHasG ? 2 : 0) + (aHasC ? 1 : 0)
    const vB = (bHasG ? 2 : 0) + (bHasC ? 1 : 0)
    return vB - vA
  })

  const linearized = nodes.map((node) => {
    const gpuForNode = gpuData[node]
    const cpuForNode = cpuData[node]
    return [
      !gpuForNode ? noData(node, "GPU Utilization") : <GPUChart logs={{ [node]: gpuForNode }} />,
      !cpuForNode ? noData(node, "CPU Utilization") : <VmstatChart logs={{ [node]: cpuData[node] }} />,
    ]
  })

  return {
    react: <div className="codeflare-chart-grid flex-fill">{linearized.flatMap((_) => _)}</div>,
  }
}
