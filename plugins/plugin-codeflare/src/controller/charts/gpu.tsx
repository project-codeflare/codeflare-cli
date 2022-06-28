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
    .split(/\n\n/gi)
    .flatMap((line) => line.trim())
    .map((line) => line.split(/\n/gi))
}

function formatLogObject(logLine: string[]) {
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

export async function parse(filepath: string, REPL: Arguments["REPL"]) {
  const logs = stripAnsi(await REPL.qexec<string>(`vfs fslice ${expand(filepath)} 0`))
  const formattedLogs = formatLogs(logs)
  return toHostMap(formattedLogs.map((logLine) => formatLogObject(logLine)))
}

export function chart(logs: Awaited<ReturnType<typeof parse>>) {
  return {
    react: (
      <ChartGrid>
        <GPUChart logs={logs} />
      </ChartGrid>
    ),
  }
}

export default async function chartCmd(args: Arguments) {
  const filepath = args.argvNoOptions[2]
  if (!filepath) {
    throw new Error(`Usage chart vmstat ${filepath}`)
  }

  return chart(await parse(filepath, args.REPL))
}
