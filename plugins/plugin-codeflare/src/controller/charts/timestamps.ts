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

import LogRecord from "./LogRecord"

export function timeRange(...records: LogRecord<unknown>[][]) {
  let min = Number.MAX_VALUE
  let max = Number.MIN_VALUE

  for (let idx = 0; idx < records.length; idx++) {
    const logs = records[idx]
    for (let jdx = 0; jdx < logs.length; jdx++) {
      const { timestamp } = logs[jdx]

      min = Math.min(min, timestamp)
      max = Math.max(max, timestamp)
    }
  }

  return { min, max }
}
