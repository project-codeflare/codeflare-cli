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

export type Summary = {
  appClass: { label: string; value: string }
  appName: { label: string; value: string }
  language: { label: string; value: string }
  pythonVersion: { label: string; value: string }
  rayVersion: { label: string; value: string }
  gpuClass: { label: string; value: string }
  workerGPUs: { label: string; value: string }
  workerMemory: { label: string; value: string }
  workerCount: { label: string; value: string }
  status: { label: string; value: string }
  parameters: { label: string; value: string }
  dataSources: { label: string; value: string }
}

export type SummaryResponse = {
  jobid: string
  cmdline: {
    appPart: string
    systemPart: string
  }
  runtimeEnv: {
    env_vars: {
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
  const { KUBE_NS, WORKER_MEMORY, NUM_GPUS, MIN_WORKERS, MAX_WORKERS, RAY_IMAGE } = summaryCmd.runtimeEnv.env_vars

  const summaryData = {
    appClass: { label: "Application Class", value: "Unknown" },
    appName: { label: "Application Name", value: "Unknown" },
    language: { label: "Source Language", value: summaryCmd.language },
    pythonVersion: { label: "Python Version", value: "Unknown" },
    rayVersion: { label: "Ray Version", value: RAY_IMAGE },
    gpuClass: { label: "GPU Class", value: KUBE_NS },
    workerGPUs: { label: "GPUs per Worker", value: NUM_GPUS },
    workerMemory: { label: "Memory per Worker", value: WORKER_MEMORY },
    workerCount: { label: "Worker Count", value: `${MIN_WORKERS}-${MAX_WORKERS}` },
    status: { label: "Status", value: "Unknown" },
    parameters: { label: "Parameters", value: "Unknown" },
    dataSources: { label: "Data Sources", value: "Unknown" },
  }

  const React = await import("react")
  const Description = await import("../components/Description")

  return {
    react: React.createElement(Description.default, { summaryData }),
  }
}

export default function registerDescriptionCommands(registrar: Registrar) {
  registrar.listen("/description", description, { needsUI: true, outputOnly: true })
}
