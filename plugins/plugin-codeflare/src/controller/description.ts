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

import { join } from "path"
import { Arguments, Registrar, encodeComponent } from "@kui-shell/core"
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

/** Given the location of the staging directory, return the location of the ray job definition */
function jobDefinition(filepath: string) {
  return encodeComponent(expand(join(filepath.replace(/'/g, ""), "ray-job-definition.json")))
}

async function app(args: Arguments) {
  const filepath = args.argvNoOptions[2]
  if (!filepath) {
    throw new Error("Usage: description application <filepath>")
  }

  const jobInfo = JSON.parse(await args.REPL.qexec<string>(`vfs fslice ${jobDefinition(filepath)} 0`))
  const { RAY_IMAGE } = jobInfo.runtime_env.env_vars

  const status = jobInfo.status.toLowerCase()

  const summaryData = [
    { label: "Application Class", value: "Unknown" }, // TODO...
    { label: "Application Name", value: "Unknown" }, // TODO...
    { label: "Base Image", value: RAY_IMAGE },
    { label: "Run Status", value: status ? status[0].toUpperCase() + status.slice(1) : "Unknown" },
  ]

  const React = await import("react")
  const Description = await import("../components/Description")

  return {
    react: React.createElement(Description.default, { summaryData }),
  }
}

async function workers(args: Arguments) {
  const filepath = args.argvNoOptions[2]
  if (!filepath) {
    throw new Error("Usage: description workers <filepath>")
  }

  const jobInfo = JSON.parse(await args.REPL.qexec<string>(`vfs fslice ${jobDefinition(filepath)} 0`))
  const { KUBE_CONTEXT, KUBE_NS, WORKER_MEMORY, MIN_WORKERS, MAX_WORKERS } = jobInfo.runtime_env.env_vars

  const summaryData = [
    { label: "Cluster Context", value: KUBE_CONTEXT.replace(/^[^/]+\//, "") },
    { label: "Cluster Namespace", value: KUBE_NS },
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
  registrar.listen("/description/application", app, { needsUI: true })
  registrar.listen("/description/workers", workers, { needsUI: true })
}
