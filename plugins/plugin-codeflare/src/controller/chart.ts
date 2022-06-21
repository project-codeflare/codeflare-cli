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

function formatLogs(logs: string) {
  return logs
    .split(/(\n)/gi)
    .flatMap((line) => line.trim())
    .filter((line) => line.length > 0)
}

async function chart(args: Arguments) {
  const filepath = args.argvNoOptions[1]
  if (!filepath) {
    return `Usage codeflare chart ${filepath}`
  }

  const logs = stripAnsi(await args.REPL.qexec(`cat ${filepath}`))
  const formattedLogs = formatLogs(logs)
  const logsMap = new Map()
  formattedLogs.forEach((log) => {
    const [value, key] = log.split(/\t\t/gi)
    logsMap.set(key, value)
  })
  console.log(logsMap)

  return logs
}

export default function registerChartCommands(registrar: Registrar) {
  registrar.listen("/chart", chart)
}
