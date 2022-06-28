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
import { expand } from "../lib/util"

type Item = { label: string; value: string }

export type Summary = Item[]

export type SummaryResponse = {
  jobid: string
  cmdline: {
    appPart: string
    systemPart: string
  }
  runtimeEnv: {
    env_vars: {
      KUBE_CONTEXT: string
      KUBE_NS: string
      WORKER_MEMORY: string
      NUM_GPUS: string
      MIN_WORKERS: string
      MAX_WORKERS: string
      RAY_IMAGE: string
    }
  }
  language: string
  source: string
}

async function description(args: Arguments) {
  const filepath = args.argvNoOptions[1]
  if (!filepath) {
    throw new Error("Usage: codeflare description <filepath>")
  }

  const summaryCmd = JSON.parse(await args.REPL.qexec<string>(`vfs fslice ${expand(filepath)} 0`))
  const { KUBE_CONTEXT, KUBE_NS, WORKER_MEMORY, MIN_WORKERS, MAX_WORKERS, RAY_IMAGE } = summaryCmd.runtimeEnv.env_vars

  const summaryData = [
    { label: "Application Class", value: "Unknown" },
    { label: "Application Name", value: "Unknown" },
    { label: "Cluster Context", value: KUBE_CONTEXT.replace(/^[^/]+\//, "") },
    { label: "Cluster Namespace", value: KUBE_NS },
    { label: "Base Image", value: RAY_IMAGE },
    { label: "GPU Class", value: "Unknown" },
    { label: "Memory per Worker", value: WORKER_MEMORY },
    { label: "Worker Count", value: `${MIN_WORKERS}-${MAX_WORKERS}` },
  ]

  const React = await import("react")
  const Description = await import("../components/Description")

  return {
    react: React.createElement(Description.default, { summaryData }),
  }
}

export default function registerDescriptionCommands(registrar: Registrar) {
  registrar.listen("/description", description, { needsUI: true, outputOnly: true })
}
