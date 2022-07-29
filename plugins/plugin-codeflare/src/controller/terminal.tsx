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

import { Arguments, Job, ReactResponse, encodeComponent, isResizable } from "@kui-shell/core"

import React from "react"
import { PassThrough } from "stream"

import respawn from "./respawn"
import Terminal from "../components/Terminal"

/**
 * This is our impl of the `watch` property that our Terminal
 * component needs, in order to support live updates.
 */
function watch(stream: PassThrough, job: Job) {
  return {
    on: stream.on.bind(stream), // data from pty to terminal
    onInput: job.write.bind(job), // user input from terminal to pty
    unwatch: job.abort.bind(job), // unmount, abort pty job
    onResize: isResizable(job) ? job.resize.bind(job) : undefined,
  }
}

/**
 * This is a command handler that opens up a terminal. The expectation
 * is that the command line to be executed is the "rest" after:
 * `codeflare terminal <rest...>`.
 */
export default function openTerminal(args: Arguments) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<ReactResponse>(async (resolve, reject) => {
    try {
      // we need this to wire the pty output through to the Terminal
      // component, which expects something stream-like
      const passthrough = new PassThrough()

      const { argv, env } = respawn(args.command.replace(/^\s*codeflare\s+terminal\s+/, ""))

      await args.REPL.qexec(argv.map((_) => encodeComponent(_)).join(" "), undefined, undefined, {
        tab: args.tab,
        env,
        quiet: true,
        onInit: () => (_) => {
          // hooks pty output to our passthrough stream
          passthrough.write(_)
        },
        onReady: (job) => {
          resolve({
            react: (
              <div
                className="kui--inverted-color-context flex-fill flex-layout flex-align-stretch"
                style={{ backgroundColor: "var(--color-sidecar-background-02)" }}
              >
                <Terminal watch={() => watch(passthrough, job)} />
              </div>
            ),
          })
        },
      })
    } catch (err) {
      reject(err)
    }
  })
}
