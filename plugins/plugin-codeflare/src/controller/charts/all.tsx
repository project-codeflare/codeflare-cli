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
import { Arguments, ReactResponse } from "@kui-shell/core"

import { expand } from "../../lib/util"

async function live(filepath: string): Promise<ReactResponse> {
  const [TailFile, split2, Combo] = await Promise.all([
    import("@logdna/tail-file").then((_) => _.default),
    import("split2").then((_) => _.default),
    import("../../components/ComboChart").then((_) => _.default),
  ])

  return new Promise<ReactResponse>((resolve, reject) => {
    try {
      const gpuTail = new TailFile(expand(join(filepath, "resources/gpu.txt")), {
        startPos: 0,
        pollFileIntervalMs: 500,
      })
      gpuTail.on("tail_error", reject)

      const cpuTail = new TailFile(expand(join(filepath, "resources/pod-vmstat.txt")), {
        startPos: 0,
        pollFileIntervalMs: 500,
      })
      cpuTail.on("tail_error", reject)

      gpuTail.start()
      cpuTail.start()

      const gpuSplitter = gpuTail.pipe(split2())
      const cpuSplitter = cpuTail.pipe(split2())

      resolve({
        react: (
          <Combo
            onGpu={gpuSplitter.on.bind(gpuSplitter)}
            onCpu={cpuSplitter.on.bind(cpuSplitter)}
            unwatch={() => {
              gpuTail.quit()
              cpuTail.quit()
            }}
          />
        ),
      })
    } catch (err) {
      reject(err)
    }
  })
}

async function offline(filepath: string, REPL: Arguments["REPL"]): Promise<ReactResponse> {
  // parse the data
  const [gpuData, cpuData] = await Promise.all([
    import("./gpu").then((_) => _.parse(join(filepath, "resources/gpu.txt"), REPL)),
    import("./vmstat").then((_) => _.parse(join(filepath, "resources/pod-vmstat.txt"), REPL)),
  ])

  const Combo = await import("../../components/ComboChart").then((_) => _.default)

  return {
    react: <Combo initialGpuData={gpuData} initialCpuData={cpuData} />,
  }
}

/**
 * Render a combo chart that interleaves GPU utilization and CPU
 * utilization charts, so that the two (for a given node) are
 * side-by-side.
 *
 */
export default async function all(args: Arguments) {
  const filepath = args.argvNoOptions[3]
  if (!filepath) {
    throw new Error(`Usage chart all ${filepath}`)
  }

  if (process.env.FOLLOW) {
    return live(filepath)
  } else {
    return offline(filepath, args.REPL)
  }
}
