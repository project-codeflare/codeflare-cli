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

import respawn from "./respawn"

import Terminal from "../components/RestartableTerminal"
import SelectedProfileTerminal from "../components/SelectedProfileTerminal"

/**
 * This is a command handler that opens up a terminal. The expectation
 * is that the command line to be executed is the "rest" after:
 * `codeflare terminal <rest...>`.
 */
export default function openTerminal(args: Arguments) {
  // respawn, meaning launch it with codeflare
  const { argv, env } = respawn(args.argv.slice(2))
  const cmdline = argv.map((_) => encodeComponent(_)).join(" ")

  return {
    react: React.createElement(
      SelectedProfileTerminal.selectedProfilePattern.test(args.command) ? SelectedProfileTerminal : Terminal,
      { cmdline, env, repl: args.REPL, tab: args.tab }
    ),
  }
}
