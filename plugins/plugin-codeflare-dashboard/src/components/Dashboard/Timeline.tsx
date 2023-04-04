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

import React from "react"
import { Box, Text } from "ink"

import type { GridSpec, Worker } from "./types.js"

import { avg } from "./stats.js"

type Props = {
  gridModels: GridSpec[]
  workers: Worker[][]
}

export default class Timeline extends React.PureComponent<Props> {
  /** Text to use for one cell's worth of time */
  private readonly block = {
    historic: "■",
    latest: "▏",
  }

  private get maxLabelLength() {
    return this.props.gridModels.filter((_) => !_.isQualitative).reduce((N, { title }) => Math.max(N, title.length), 0)
  }

  /** @return max number of time cells, across all grids and all workers */
  private nTimeCells() {
    // outer loop: iterate across grids
    return this.props?.workers.reduce((nTimes, _) => {
      if (Array.isArray(_) && _.length > 0) {
        return Math.max(
          nTimes,
          _.reduce((nTimesInner, _) => Math.max(nTimesInner, _.metricHistory.length), 0)
          // ^^^ inner loop, iterate across workers in that grid
        )
      } else {
        return nTimes
      }
    }, 0)
  }

  /**
   * Render one cell to represent the average over the given `workers`
   * for the given grid, for the given time.
   */
  private cell(workers: Worker[], spec: GridSpec, timeIdx: number, isLatest: boolean) {
    const metricIdx = avg(workers, "metricIdxTotal", timeIdx)
    const style = spec.states[metricIdx] ? spec.states[metricIdx].style : { color: "gray", dimColor: true }

    return (
      <React.Fragment key={timeIdx}>
        <Text {...style}>{this.block.historic}</Text>
        <Text dimColor>{isLatest ? this.block.latest : ""}</Text>
      </React.Fragment>
    )
  }

  /** Render one horizontal array of cells for the given grid */
  private cells(workers: Worker[], spec: GridSpec, nTimes: number, timeStartIdx: number) {
    return Array(nTimes - timeStartIdx)
      .fill(0)
      .map((_, idx, A) => this.cell(workers, spec, idx + timeStartIdx, idx === A.length - 1))
  }

  /** Render the timeline UI for the given grid */
  private timeline(workers: Worker[], spec: GridSpec, nTimes: number, timeStartIdx: number) {
    return spec.isQualitative ? (
      <React.Fragment />
    ) : (
      <React.Fragment>
        <Box justifyContent="flex-end">
          <Text>{spec.title.padStart(this.maxLabelLength)}</Text>
        </Box>
        <Box marginLeft={1}>{this.cells(workers, spec, nTimes, timeStartIdx)}</Box>
      </React.Fragment>
    )
  }

  public render() {
    if (!this.props?.workers) {
      // no grid info, yet
      return <React.Fragment />
    }

    const nTimes = this.nTimeCells()

    // to help us compute whether we are about to overflow terminal width
    const maxLabelLength = this.props.gridModels.reduce((N, spec) => {
      return Math.max(N, spec.title.length)
    }, 0)

    // once we overflow, display the suffix of history information, starting at this index
    const timeStartIdx = Math.abs(Math.max(0, nTimes + maxLabelLength - process.stdout.columns))

    if (nTimes === 0) {
      // none of the grids have any temporal information, yet
      return <React.Fragment />
    } else {
      // render one `this.timeline()` row per grid
      return (
        <Box flexDirection="column">
          {this.props.workers.map((workers, gridIdx) => (
            <Box key={gridIdx}>{this.timeline(workers, this.props.gridModels[gridIdx], nTimes, timeStartIdx)}</Box>
          ))}
        </Box>
      )
    }
  }
}
