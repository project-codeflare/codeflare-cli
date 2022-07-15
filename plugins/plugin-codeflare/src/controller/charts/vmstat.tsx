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
import { Arguments, ReactResponse, encodeComponent } from "@kui-shell/core"

import { expand } from "../../lib/util"
import { timeRange } from "./timestamps"
import LogRecord, { toHostMap } from "./LogRecord"

import ChartGrid from "../../components/ChartGrid"
import VmstatChart from "../../components/VmstatChart"

export type Log = LogRecord<{
  user: number
  system: number
  idle: number
  iowait: number
  freeMemory: number
}>

/** log line -> Log object */
export function parseLine(line: string): Log {
  const cells = line.split(/\s+/)

  const N = cells.length
  const hostname = cells[0]
  const freeMemory = parseInt(cells[4], 10)
  const user = parseInt(cells[13], 10)
  const system = parseInt(cells[14], 10)
  const idle = parseInt(cells[15], 10)
  const iowait = parseInt(cells[16], 10)
  const timestamp = new Date(cells[N - 2] + " " + cells[N - 1]).getTime()

  return {
    hostname,
    timestamp,
    user,
    system,
    idle,
    iowait,
    freeMemory,
  }
}

export function filter(line: string): boolean {
  return !!line && !/----|swpd/.test(line)
}

export async function parse(filepath: string, REPL: Arguments["REPL"]): Promise<Log[]> {
  return (await REPL.qexec<string>(`vfs fslice ${encodeComponent(expand(filepath))} 0`))
    .split(/\n/) // now we have rows
    .filter(filter) // filter those rows
    .map(parseLine) // parse the line a `Log` object
    .sort((a, b) => a.hostname.localeCompare(b.hostname))
}

function chart(logs: Awaited<ReturnType<typeof parse>>): ReactResponse {
  const { min, max } = timeRange(logs)

  return {
    react: (
      <ChartGrid>
        <VmstatChart logs={toHostMap(logs)} minTime={min} maxTime={max} />
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
