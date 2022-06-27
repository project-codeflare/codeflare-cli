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
import { Arguments } from "@kui-shell/core"

import { expand } from "../../lib/util"
import VmstatChart from "../../components/VmstatChart"

export type Log = {
  hostname: string
  timestamp: number
  user: number
  system: number
  idle: number
  iowait: number
  freeMemory: number
}

function parse(cells: string[]): Log {
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

export default async function chart(args: Arguments) {
  const filepath = args.argvNoOptions[2]
  if (!filepath) {
    return `Usage chart vmstat ${filepath}`
  }

  const logs = (await args.REPL.qexec<string>(`vfs fslice ${expand(filepath)} 0`))
    .split(/\n/)
    .filter((logLine) => logLine && !/----|swpd/.test(logLine))
    .map((_) => _.split(/\s+/))
    .map(parse)
    .sort((a, b) => a.hostname.localeCompare(b.hostname))

  return {
    react: (
      <div className="codeflare-chart-grid flex-fill">
        <VmstatChart logs={logs} />
      </div>
    ),
  }
}
