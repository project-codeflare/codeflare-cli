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

import { Arguments, Registrar, encodeComponent } from "@kui-shell/core"

import { expand } from "../lib/util"
import { followFlags, FollowOptions } from "./dashboard"

async function tail(args: Arguments<FollowOptions>) {
  const filepath = args.argvNoOptions[2]
  if (!filepath) {
    throw new Error("Usage: codeflare tail <filepath>")
  }

  const fp = expand(filepath)
  const [React, Terminal] = await Promise.all([
    import("react"),
    import("../components/Terminal").then((_) => _.default),
  ])

  if (process.env.FOLLOW) {
    const TailFile = await import("@logdna/tail-file").then((_) => _.default)
    const tail = new TailFile(fp, { startPos: 0, pollFileIntervalMs: 500 })
    tail.start()
    tail.on("tail_error", (err) => console.error(err))

    return {
      react: React.createElement(Terminal, {
        on: tail.on.bind(tail),
        unwatch: tail.quit.bind(tail),
      }),
    }
  } else {
    const initialContent = await args.REPL.qexec<string>(`vfs fslice ${encodeComponent(fp)} 0`)

    return {
      react: React.createElement(Terminal, { initialContent }),
    }
  }
}

export default function registerTailfCommands(registrar: Registrar) {
  registrar.listen("/codeflare/tailf", tail, { flags: followFlags })
}
