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
import { Arguments, encodeComponent } from "@kui-shell/core"
import { respawn } from "@kui-shell/plugin-madwizard/watch"
import { RestartableTerminal } from "@kui-shell/plugin-madwizard/components"

/**
 * This is a command handler that opens up a plain terminal that shows
 * a login session using the user's $SHELL.
 *
 */
export async function shell(args: Arguments) {
  // respawn, meaning launch it with codeflare
  const { argv, env } = await respawn(["$SHELL", "-l"])
  const cmdline = argv.map((_) => encodeComponent(_)).join(" ")

  return {
    react: <RestartableTerminal cmdline={cmdline} env={env} REPL={args.REPL} tab={args.tab} />,
  }
}
