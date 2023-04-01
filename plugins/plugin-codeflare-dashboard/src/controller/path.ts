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

import { pathsFor } from "./dashboard/tailf.js"

/** @return path to the data captured for the given jobId in the given profile */
export async function pathFor(profile: string, jobId: string) {
  const { dirname } = await import("path")
  return Array.from(new Set(await pathsFor("cpu%", profile, jobId).then((_) => _.map((_) => dirname(dirname(_))))))[0]
}
