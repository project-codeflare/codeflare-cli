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

import type { Worker } from "../../components/Job/types.js"

/** Configuration governining the history model of states per worker */
type HistoryConfig = {
  /** Earliest timestamp we should use as the delta from which history bucket indices are computed */
  start?: number

  /** Millis per bucket of history */
  width: number
}

/** Map a `millis` since epoch to a history bucket */
function bucketIdx(millis: number, cfg: HistoryConfig): number {
  return ~~((millis - (cfg.start || millis)) / cfg.width)
}

/**
 * Update the given `metricHistory` to record the given metric `value`
 * recorded at time `millis` since epoch.
 */
export function update(
  value: number,
  metricIdx: number,
  millis: number,
  cfg: HistoryConfig,
  metricHistory: Worker["metricHistory"] = []
) {
  if (!cfg.start || millis < cfg.start) {
    // remember the earliest timestamp
    cfg.start = millis
  }

  const historyIdx = bucketIdx(millis, cfg)

  if (!metricHistory[historyIdx]) {
    metricHistory[historyIdx] = { N: 1, valueTotal: value, metricIdxTotal: metricIdx }
  } else {
    metricHistory[historyIdx].N++
    metricHistory[historyIdx].valueTotal += value
    metricHistory[historyIdx].metricIdxTotal += metricIdx
  }

  return metricHistory
}

export default HistoryConfig
