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

import { Arguments, Registrar, Table } from "@kui-shell/core"

function rewriteOnClicks(dir: Table, path: string): Table {
  dir.body.forEach((row) => (row.onclick = `dashboard ${path}/${row.name}`))
  return dir
}

async function runs(args: Arguments) {
  const filepath = args.argvNoOptions[1]
  if (!filepath) {
    throw new Error(`Usage: codeflare runs <filepath>`)
  }
  const directory = await args.REPL.qexec<Table>(`ls -la ${filepath}`)
  return rewriteOnClicks(directory, filepath)
}

export default function registerRunsCommands(registrar: Registrar) {
  registrar.listen("/runs", runs, {
    needsUI: true,
    width: 1280,
    height: 960,
  })
}
