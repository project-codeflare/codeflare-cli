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
import { Arguments } from "@kui-shell/core"

import { expand } from "../../lib/util"
import GPUChart from "../../components/GPUChart"

export type Log = {
  cluster: string
  timestamp: number
  gpuType: string
  utilizationGPU: number
  utilizationMemory: number
  totalMemory: number
  temperatureGPU: number
}

function formatLogs(logs: string) {
  return logs
    .split(/\n\n/gi)
    .flatMap((line) => line.trim())
    .map((line) => line.split(/\n/gi))
}

function formatLogObject(logLine: string[]) {
  const splittedLine = logLine[0].split(/\s|\t\t/gi)
  const cluster = splittedLine[splittedLine.length - 3]
  const timestamp = new Date(splittedLine.slice(splittedLine.length - 2).join(" ")).getTime()
  const gpuType = splittedLine.slice(0, splittedLine.length - 5).join(" ")

  const utilizationData = logLine.map((line) => parseInt(line.trim().split(" ")[0]))
  const [, utilizationGPU, utilizationMemory, totalMemory, temperatureGPU] = utilizationData

  const newObj: Log = {
    cluster,
    timestamp,
    gpuType,
    utilizationGPU,
    utilizationMemory,
    totalMemory,
    temperatureGPU,
  }
  return newObj
}

export default async function chart(args: Arguments) {
  const filepath = args.argvNoOptions[2]
  if (!filepath) {
    return `Usage chart gpu ${filepath}`
  }

  const logs = stripAnsi(await args.REPL.qexec<string>(`vfs fslice ${expand(filepath)} 0`))
  const formattedLogs = formatLogs(logs)
  const objLogs = formattedLogs.map((logLine) => formatLogObject(logLine))

  return {
    react: (
      <div className="codeflare-chart-grid flex-fill">
        <GPUChart logs={objLogs} />
      </div>
    ),
  }
}
