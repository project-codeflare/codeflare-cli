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
import { Arguments, ReactResponse, encodeComponent } from "@kui-shell/core"

import { expand } from "../../lib/util"
import { timeRange } from "./timestamps"
import LogRecord, { toHostMap } from "./LogRecord"

import GPUChart from "../../components/GPUChart"
import ChartGrid from "../../components/ChartGrid"

export type Log = LogRecord<{
  gpuType: string
  utilizationGPU: number
  utilizationMemory: number
  totalMemory: number
  temperatureGPU: number
}>

function formatLogs(logs: string) {
  return logs
    .split(/\n\n/)
    .flatMap((line) => line.trim())
    .map((line) => line.split(/\n/))
}

export const nLinesPerGPURecord = 5

export function parseRecord(logLine: string[]) {
  const splittedLine = logLine[0].split(/\s|\t\t/gi)
  const hostname = splittedLine[splittedLine.length - 3]
  const timestamp = new Date(splittedLine.slice(splittedLine.length - 2).join(" ")).getTime()
  const gpuType = splittedLine.slice(0, splittedLine.length - 5).join(" ")

  const utilizationData = logLine.map((line) => parseInt(line.trim().split(" ")[0]))
  const [, utilizationGPU, utilizationMemory, totalMemory, temperatureGPU] = utilizationData

  const newObj: Log = {
    hostname,
    timestamp,
    gpuType,
    utilizationGPU,
    utilizationMemory,
    totalMemory,
    temperatureGPU,
  }
  return newObj
}

export async function parse(filepath: string, REPL: Arguments["REPL"]): Promise<Log[]> {
  const logs = stripAnsi(await REPL.qexec<string>(`vfs fslice ${encodeComponent(expand(filepath))} 0`))
  const formattedLogs = formatLogs(logs)
  return formattedLogs.map((logLine) => parseRecord(logLine))
}

function chart(logs: Awaited<ReturnType<typeof parse>>): ReactResponse {
  const { min, max } = timeRange(logs)

  return {
    react: (
      <ChartGrid>
        <GPUChart logs={toHostMap(logs)} minTime={min} maxTime={max} />
      </ChartGrid>
    ),
  }
}

export default async function chartCmd(args: Arguments) {
  const filepath = args.argvNoOptions[3]
  if (!filepath) {
    throw new Error(`Usage chart vmstat ${filepath}`)
  }

  return chart(await parse(filepath, args.REPL))
}
