/*
 * Copyright 2023 The Kubernetes Authors
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

import type { SupportedGrid } from "./grids.js"

type Kind = SupportedGrid | "logs"
export type KindA = Kind | "all"
export default Kind

export const resourcePaths: Record<Kind, string[]> = {
  status: [
    "events/kubernetes.txt",
    "events/job-status.txt",
    "events/pods.txt",
    "events/runtime-env-setup.txt",
    "logs/job.txt",
  ],
  "gpu%": ["resources/gpu.txt"],
  "gpumem%": ["resources/gpu.txt"],
  "cpu%": ["resources/pod-vmstat.txt"],
  "mem%": ["resources/pod-memory.txt"],
  logs: ["logs/job.txt"],
}

export function validKinds() {
  return Object.keys(resourcePaths)
}

export function isValidKind(kind: string): kind is Kind {
  return validKinds().includes(kind)
}

export function isValidKindA(kind: string): kind is KindA {
  return isValidKind(kind) || kind === "all"
}
