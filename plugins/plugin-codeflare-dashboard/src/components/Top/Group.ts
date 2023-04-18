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

import type { Breakdown, HostRec, JobRec, PodRec } from "./types.js"

type Group = {
  groupIdx: number
  job: JobRec
  ctime: number
  hosts: HostRec[]
  pods: PodRec[]
  stats: { min: Breakdown; tot: Breakdown }
}

export default Group
