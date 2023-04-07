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
import { Box, BoxProps, Spacer, Text, TextProps } from "ink"

import type { Props, State } from "./index.js"
import type { UpdatePayload, Worker } from "./types.js"

import { avg } from "./stats.js"

type GridProps = {
  /** Position of legend w.r.t. the grid UI [default: "below"] */
  legendPosition?: "right" | "below"

  isQualitative: boolean
  scale: Props["scale"]
  title: NonNullable<Props["grids"][number]>["title"]
  states: NonNullable<Props["grids"][number]>["states"]
  workers: State["workers"][number]
}

export default class Grid extends React.PureComponent<GridProps> {
  /** Chunk `A` into subarrays of at most length `N` */
  private chunk<T>(A: T[], N: number): T[][] {
    const matrix = Array(N).fill(undefined)
    for (let i = 0; i < N; i++) {
      matrix[i] = Array(N).fill(undefined)
      for (let j = 0; j < N; j++) {
        const a = A[i * N + j]
        if (a !== undefined) {
          matrix[i][j] = a
        }
      }
    }

    // leftover?
    const lastIdx = N * N
    if (lastIdx < A.length) {
      const L: T[] = []
      matrix.push(L)
      for (let j = lastIdx; j < A.length; j++) {
        L.push(A[j])
      }
    }

    return matrix
  }

  // private readonly sizes = ["▁▁", "▃▃", "▅▅", "▆▆", "██", "■■"]

  private readonly defaultCell = "█▉"
  private cellFor(props: TextProps): TextProps {
    return Object.assign({ children: this.defaultCell }, props)
  }

  private get emptyCell(): TextProps {
    // TODO in light terminal themes, white-dim is a better choice
    // than gray-dim
    return this.cellFor({ color: "gray", dimColor: true })
  }

  /** @return current `Worker[]` model */
  private get workers(): UpdatePayload["workers"] {
    return this.props.workers || []
  }

  /** Zoom/Scale up the grid? */
  private get scale() {
    return Math.max(this.props.scale || 1, 1)
  }

  /**
   * For visual clarity with a small number of workers, you may set a
   * minimum length of grid sides (Note: it will be square, so this is
   * just the length of a side in the grid/heat map).
   */
  private get minMatrixSize() {
    return 4
  }

  private matrixModel(): Worker[][] {
    const N = Math.max(this.minMatrixSize, Math.ceil(Math.sqrt(this.workers.length)))
    return this.chunk(this.workers, N)
  }

  /** Histogram form of `this.workers` */
  private histoModel(): number[] {
    const keys = this.props.states
    const indexer = keys.reduce((M, { state }, idx) => {
      M[state] = idx
      return M
    }, {} as Record<string, number>)

    return this.workers.reduce((H, worker) => {
      H[indexer[worker.metric]]++
      return H
    }, Array(keys.length).fill(0))
  }

  /** @return legend UI */
  private legend() {
    const H = this.histoModel()
    const outerBoxProps: BoxProps = {
      marginRight: this.props.legendPosition === "right" ? 2 : 1,
      justifyContent: "flex-end",
    }
    const innerBoxProps: BoxProps = {
      // flexDirection: "row", // values to the right of labels
      flexDirection: "column", // values below labels
      alignItems: "flex-end",
    }
    const valueProps = {}

    // arrange into a kind of matrix with at most `k` labels per row
    const k = 3 // TODO take into account width of screen
    const A = this.chunk(this.props.states, k)
    const C = this.chunk(H, k).filter(Boolean)

    return (
      <Box flexDirection="column">
        {A.filter(Boolean).map((AA, ridx) => (
          /* legend row */
          <Box key={ridx} flexDirection="row" justifyContent="space-between">
            {AA.filter(Boolean).map((_, cidx) => (
              /* legend entry (i.e. legend column) */
              <Box key={_.state} {...outerBoxProps}>
                <Box {...innerBoxProps}>
                  {/* legend entry label */}
                  <Box>
                    <Text {..._.style} bold>
                      {_.state}
                    </Text>
                  </Box>

                  {/* legend entry value */}
                  <Box {...valueProps}>
                    <Text {..._.style}>{C[ridx][cidx] /*.toString().padStart(maxLen)*/}</Text>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    )
  }

  /** @return the UI for one row of the grid */
  private gridRow(row: Worker[], ridx: number) {
    return (
      <Box key={ridx}>
        {row.map((worker, cidx) => (
          <Text key={cidx} {...(!worker ? this.emptyCell : this.cellFor(worker.style))} />
        ))}
      </Box>
    )
  }

  /** @return grid UI */
  private grid() {
    const M = this.matrixModel()
    return (
      <Box flexDirection="column">
        {M.map((row, ridx) =>
          Array(this.scale)
            .fill(0)
            .map((_, sidx) => this.gridRow(row, this.scale * ridx + sidx))
        )}
      </Box>
    )
  }

  private title() {
    return (
      <React.Fragment>
        <Text>{this.props.title}</Text>
        {this.props.isQualitative ? (
          <React.Fragment />
        ) : (
          <React.Fragment>
            <Spacer />
            <Text color="yellow">μ={avg(this.props.workers)}%</Text>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }

  private get legendPosition() {
    return this.props.legendPosition
  }

  public render() {
    const flexDirection = this.legendPosition === "below" ? "column" : "row"
    const alignItems = this.legendPosition === "below" ? "center" : "center"
    const legendBoxProps = this.legendPosition === "below" ? { marginTop: 1 } : { marginLeft: 2 }

    return (
      <Box
        flexDirection={flexDirection}
        alignItems={alignItems}
        justifyContent="center"
        paddingTop={1}
        paddingBottom={1}
      >
        {/* title and grid */}
        <Box flexDirection="column" alignItems="center">
          {this.title()}
          {this.grid()}
        </Box>

        {/* legend */}
        <Box {...legendBoxProps}>{this.legend()}</Box>
      </Box>
    )
  }
}
