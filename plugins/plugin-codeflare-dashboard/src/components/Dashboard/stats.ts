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

import type { Worker } from "./types.js"

/** @return the accumulated `total` and count `N` across a set of `workers` for the given `timeIdx` */
function accum(workers: Worker[], timeIdx: number, field: "valueTotal" | "metricIdxTotal") {
  return workers.reduce(
    (A, worker) => {
      const history = worker.metricHistory
      if (history[timeIdx]) {
        A.total += history[timeIdx][field]
        A.N += history[timeIdx].N
      }
      return A
    },
    { total: 0, N: 0 }
  )
}

/** @return average metric value across a set of `workers` for the given `timeIdx` */
export function avg(
  workers: Worker[],
  field: "valueTotal" | "metricIdxTotal" = "valueTotal",
  timeIdx = workers.reduce((M, _) => Math.max(M, _.metricHistory.length), 0)
): number {
  const { total, N } = accum(workers, timeIdx, field)
  if (N === 0) {
    if (timeIdx === 0) return 0
    else {
      for (let t = timeIdx - 1; t >= 0; t--) {
        const { total, N } = accum(workers, t, field)
        if (N !== 0) {
          return Math.round(total / N)
        }
      }
      return 0
    }
  }

  return Math.round(total / N)
}

/** @return long-term average, averaged over time and across a set of `workers` */
export function longTermAvg(workers: Worker[], nTimes: number) {
  const { total, N } = Array(nTimes)
    .fill(0)
    .map((_, timeIdx) => accum(workers, timeIdx, "valueTotal"))
    .reduce(
      (A, { total, N }) => {
        A.total += total
        A.N += N
        return A
      },
      { total: 0, N: 0 }
    )

  return Math.round(total / N)
}
