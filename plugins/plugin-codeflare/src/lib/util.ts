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

/** Expand env vars */
export function expand(expr: string): string {
  return expr.replace(/\${?([^}/\s]+)}?/g, (_, p1) => process.env[p1] || p1)
}

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
