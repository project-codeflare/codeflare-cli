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

import { Arguments } from "@kui-shell/core"
import { doExecWithPty } from "@kui-shell/plugin-bash-like"
import { setTabReadonly } from "@kui-shell/plugin-madwizard"

import respawnCommand from "./respawn"

/**
 * Entrypoint for madwizard tasks from tray.ts. We could improve the
 * design here. For now, we launch ourselves as a subprocess and
 * render the results in an xterm/pty container.
 *
 * see bin/codeflare; we are mostly copying bits from there
 */
export default function guide(args: Arguments) {
  setTabReadonly(args)

  const { argv, env } = respawnCommand(
    args.command.replace(/--type=renderer/, "").replace(/^codeflare\s+gui\s+guide/, "codeflare") + " -y" // run in non-interactive mode (-y is short for --yes)
  )

  args.command = argv.join(" ")
  args.execOptions.env = env

  return doExecWithPty(args)
}
