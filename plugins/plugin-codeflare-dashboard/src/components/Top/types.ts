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

export type ResourceSpec = { request: number; limit: number }

export const ValidResources = ["cpu", "mem", "gpu"] as const

export type Resource = (typeof ValidResources)[number]

type ResourceSpecs = Record<Resource, ResourceSpec>

/** Model for one pod */
export type PodRec = ResourceSpecs & {
  name: string
  job: string
  jobIdx: number
  host: string
  tot: Breakdown

  /** creationTimestamp in millis since epoch */
  ctime: number
}

/** Model for one job */
export type JobRec = { name: string; jobIdx: number; pods: PodRec[] }

/** Model for one host */
export type HostRec = { host: string; jobs: JobRec[] }

/** Breakdown of consumption by resource */
export type Breakdown = Record<Resource, number>

/** Updated host model */
type JobsByHost = {
  /** Model */
  hosts: HostRec[]

  /** Statistics over the model */
  stats: { min: Breakdown; tot: Record<string, Breakdown> }
}

/** The cluster focus of the model */
export type Context = {
  /** Kubernetes cluster name */
  cluster: string

  /** Kubernetes namespace */
  namespace: string
}

/** Updated model */
export type UpdatePayload = Context & JobsByHost

export type OnData = (payload: UpdatePayload) => void

export type WatcherInitializer = (context: Context, cb: OnData) => Promise<{ kill(): void }>

export type ChangeContextRequest = { which: "context" | "namespace"; from: string; dir: "down" | "up" }

export type ChangeContextRequestHandler = (req: ChangeContextRequest) => Promise<string | undefined>
