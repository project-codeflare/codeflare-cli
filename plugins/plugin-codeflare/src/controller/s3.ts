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

async function dirs(args: Arguments) {
  const { join } = await import("path")
  await import("@kui-shell/plugin-s3").then((_) => _.enable())
  return args.argvNoOptions.slice(3).map((_) => join("/s3", _))
}

async function ls(args: Arguments) {
  return args.REPL.qexec("ls " + (await dirs(args)).join(" "))
}

async function select(args: Arguments) {
  return args.REPL.qexec("ls " + (await dirs(args)).join(" "))
}

export default function s3Behaviors(registrar: Registrar) {
  registrar.listen("/codeflare/s3/ls", ls)
  registrar.listen("/codeflare/s3/select", select, { needsUI: true })
}
