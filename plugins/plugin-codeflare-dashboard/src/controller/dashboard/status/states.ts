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

export const states = ["Queued", "Provisioning", "Initializing", "Running", "Success", "Failed"]

/** Type declaration for quantized utilization states */
export type WorkerState = (typeof states)[number]

/** Lower means more important */
export const rankFor: Record<WorkerState, number> = {
  Queued: 3,
  Provisioning: 1,
  Initializing: 2,
  Running: 1,
  Success: 0,
  Failed: 0,
}

export const stateFor: Record<string, WorkerState> = {
  Pending: "Queued",
  Queued: "Queued",
  Job_Pending: "Initializing", // this comes after the job is submitted, but probably preparing deps

  ContainerCreating: "Provisioning",
  SuccessfulCreate: "Provisioning",
  AddedInterface: "Provisioning",
  Created: "Provisioning",
  Scheduled: "Provisioning",

  Unhealthy: "Provisioning", // service not yet ready... Initializing?

  Initializing: "Provisioining",
  Installing: "Provisioining",
  Pulling: "Provisioining",
  Pulled: "Initializing",

  Started: "Initializing",
  Workers_Running: "Initializing",

  Job_Running: "Running",

  Success: "Success",
  Succeeded: "Success",

  // ignore these
  // Workers_Terminating: "Success",
  // Workers_Killing: "Success",

  Failed: "Failed",
  FailedScheduling: "Failed",
  Workers_Evicted: "Failed",
}
