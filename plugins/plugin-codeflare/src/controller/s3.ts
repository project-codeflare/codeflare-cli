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

/**
 * @return the filepaths as specified on the command line, but
 * modified to be in a filepath format that is compatible with Kui's
 * plugin-s3; mostly this means prepending '/s3/' to each filepath
 * provided on the initial command line
 */
async function dirs(args: Arguments): Promise<string[]> {
  const { join } = await import("path")
  await import("@kui-shell/plugin-s3").then((_) => _.enable())
  return args.argvNoOptions.slice(3).map((_) => join("/s3", _))
}

/**
 * @return a suffix command line that can be used to enumerate a set
 * of filepaths as specified on the command line; if none are
 * provided, defaults to list all recognized s3 providers
 */
async function rest(args: Arguments): Promise<string> {
  return (await dirs(args)).join(" ") || "/s3"
}

/** A Kui controller that provides CLI experience for browsing s3 */
async function ls(args: Arguments) {
  return args.REPL.qexec("ls " + (await rest(args)))
}

/** (TODO) A Kui controller that allows the user to select a filepath, while browsing */
async function select(args: Arguments) {
  return args.REPL.qexec("ls " + (await rest(args)))
}

export default function s3Behaviors(registrar: Registrar) {
  registrar.listen("/codeflare/s3/ls", ls)
  registrar.listen("/codeflare/s3/select", select, { needsUI: true })
}
