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

import { Arguments, Registrar } from "@kui-shell/core"
import stripAnsi from "strip-ansi"

type Log = {
  cluster: string
  timestamp: number
  typeGPU: string
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
  const timestamp = new Date(splittedLine.slice(splittedLine.length - 2).join(" ")).getTime()

  const cluster = splittedLine[splittedLine.length - 3]

  const newObj: Log = {
    cluster,
    timestamp,
    typeGPU: "",
    utilizationGPU: 0,
    utilizationMemory: 0,
    totalMemory: 0,
    temperatureGPU: 0,
  }
  return newObj
}

async function chart(args: Arguments) {
  const filepath = args.argvNoOptions[1]
  if (!filepath) {
    return `Usage codeflare chart ${filepath}`
  }

  const logs = stripAnsi(await args.REPL.qexec(`cat ${filepath}`))
  const formattedLogs = formatLogs(logs)
  const objLogs = formattedLogs.map((logLine) => formatLogObject(logLine))

  return JSON.stringify(objLogs)
}

export default function registerChartCommands(registrar: Registrar) {
  registrar.listen("/chart", chart)
}
