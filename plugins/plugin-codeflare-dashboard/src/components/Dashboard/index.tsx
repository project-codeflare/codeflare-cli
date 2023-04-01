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
import prettyMillis from "pretty-ms"
import { Box, BoxProps, Spacer, Text, TextProps } from "ink"

export type Worker = {
  /** Identifier of this worker */
  name: string

  /** Current metric value */
  metric: string

  /** Color for grid cell and legend */
  style: TextProps

  /** millis since epoch of the first update */
  firstUpdate: number

  /** millis since epoch of the last update */
  lastUpdate: number
}

/** Updated info from controller */
type UpdatePayload = {
  /** Per-worker status info */
  workers: Worker[]

  /** Lines of raw output to be displayed */
  lines?: { lines: string[]; idx: number; N: number }
}

/** Callback from controller when it has updated data */
export type OnData = (payload: UpdatePayload) => void

export type GridSpec = {
  /** title of grid */
  title: string

  /** Names for distinct states */
  states: { state: string; style: TextProps }[]

  /** Init updater that returns a cancellation function */
  initWatcher(cb: OnData): { quit: () => void }
}

type Props = {
  /** CodeFlare Profile for this dashboard */
  profile: string

  /** Job ID that this dashboard visualizes */
  jobId: string

  /** Scale up the grid? [default: 1] */
  scale?: number

  grids: (null | GridSpec)[]
}

type State = {
  /** millis since epoch of the first update */
  firstUpdate: number

  /** millis since epoch of the last update */
  lastUpdate: number

  /** iteration count to help us keep "last updated ago" UI fresh */
  iter: number

  /** interval to keep "last updated ago" UI fresh */
  agoInterval: ReturnType<typeof setInterval>

  /** Lines of raw output to be displayed */
  lines: UpdatePayload["lines"]

  /** Controller that allows us to shut down gracefully */
  watchers: { quit: () => void }[]

  /** Model of current workers */
  workers: UpdatePayload["workers"][]
}

type GridProps = {
  /** Position of legend w.r.t. the grid UI [default: "below"] */
  legendPosition?: "right" | "below"

  scale: Props["scale"]
  title: NonNullable<Props["grids"][number]>["title"]
  states: NonNullable<Props["grids"][number]>["states"]
  workers: State["workers"][number]
}

class Grid extends React.PureComponent<GridProps> {
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

  private readonly cell = "█▉"
  private cellFor(props: TextProps): TextProps {
    return Object.assign({ children: this.cell }, props)
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
    return 6
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
      marginRight: 1,
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
                <Box {...innerBoxProps} marginLeft={1}>
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
    return <Text>{this.props.title}</Text>
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

export default class Dashboard extends React.PureComponent<Props, State> {
  private get grids(): GridSpec[] {
    return this.props.grids.filter((_) => _ !== null) as GridSpec[]
  }

  public componentDidMount() {
    this.setState({
      workers: [],
      watchers: this.grids.map((props, gridIdx) =>
        props.initWatcher((model: UpdatePayload) => this.onUpdate(gridIdx, model))
      ),
      agoInterval: setInterval(() => this.setState((curState) => ({ iter: (curState?.iter || 0) + 1 })), 5 * 1000),
    })
  }

  public componentWillUnmount() {
    if (this.state?.watchers) {
      this.state.watchers.forEach((_) => _.quit())
    }
    if (this.state?.agoInterval) {
      clearInterval(this.state.agoInterval)
    }
  }

  /** We have received an update from `this.props.initWatcher` */
  private readonly onUpdate = (gridIdx: number, model: UpdatePayload) => {
    this.setState((curState) => ({
      firstUpdate: (curState && curState.firstUpdate) || Date.now(), // TODO pull from the events
      lastUpdate: Date.now(), // TODO pull from the events
      lines: !model.lines || model.lines.N === 0 ? curState?.lines : model.lines,
      workers: !curState?.workers
        ? [model.workers]
        : [...curState.workers.slice(0, gridIdx), model.workers, ...curState.workers.slice(gridIdx + 1)],
    }))
  }

  /** @return current `lines` model */
  private get lines(): UpdatePayload["lines"] {
    return this.state?.lines
  }

  /** @return first update time */
  private get firstUpdate() {
    return this.state?.firstUpdate || Date.now()
  }

  /** @return last update time */
  private get lastUpdate() {
    return this.state?.lastUpdate || Date.now()
  }

  /** @return last update time delta */
  private get lastUpdatedAgo() {
    return Date.now() - this.lastUpdate
  }

  /** @return duration covered by this view */
  private get duration() {
    return this.lastUpdate - this.firstUpdate
  }

  private header() {
    return (
      <Box borderStyle="doubleSingle" flexDirection="column">
        <Box>
          <Text>
            <Text color="blue" bold>
              Profile{" "}
            </Text>
            {this.props.profile}
          </Text>

          <Spacer />

          <Box marginLeft={1}>
            <Text>
              <Text color="blue" bold>
                Duration{" "}
              </Text>
              {prettyMillis(this.duration, { compact: true }).padEnd(10)}
            </Text>
          </Box>
        </Box>

        <Box>
          <Text>
            <Text color="blue" bold>
              {"Job".padStart("Profile".length)}{" "}
            </Text>
            {this.props.jobId}
          </Text>

          <Spacer />

          <Box marginLeft={1}>
            <Text>
              <Text color="blue" bold>
                Last updated{" "}
              </Text>
              {this.ago(this.lastUpdatedAgo).padEnd(10)}
            </Text>
          </Box>
        </Box>
      </Box>
    )
  }

  private ago(millis: number) {
    return prettyMillis(millis, { compact: true }) + " ago"
  }

  private agos(timestamp: string) {
    return this.ago(Date.now() - new Date(timestamp).getTime())
  }

  private footer() {
    if (!this.lines) {
      return <React.Fragment />
    } else {
      const rows = []
      for (let idx = this.lines.idx, n = 0; n < this.lines.N; idx = (idx + 1) % this.lines.lines.length, n++) {
        const line = this.lines.lines[idx]
          .replace(/(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\dZ)/, (_, timestamp) => this.agos(timestamp))
          .replace(/pod\/torchx-\S+ /, "") // worker name in torchx
          .replace(/pod\/ray-(head|worker)-\S+ /, "") // worker name in ray
          .replace(/\* /, "") // wildcard worker name (codeflare)

        // [2J is part of clear screen; we don't want those to flow through
        // eslint-disable-next-line no-control-regex
        rows.push(<Text key={line + "-" + n}>{line.replace(/\x1b\x5B\[2J/g, "")}</Text>)
      }
      return (
        <Box marginTop={1} flexDirection="column">
          {rows}
        </Box>
      )
    }
  }

  private gridRows() {
    const rows: { widx: number; grid: NonNullable<Props["grids"][number]> }[][] = []
    for (let idx = 0, ridx = 0, widx = 0; idx < this.props.grids.length; idx++) {
      const grid = this.props.grids[idx]
      if (grid === null) {
        ridx++
      } else {
        if (!rows[ridx]) {
          rows[ridx] = []
        }
        rows[ridx].push({ grid, widx: widx++ })
      }
    }
    return rows
  }

  private body() {
    return this.gridRows().map((row, ridx) => (
      <Box key={ridx} justifyContent="space-around">
        {row.map(({ grid, widx }) => (
          <Box key={grid.title} marginLeft={2}>
            <Grid
              key={grid.title}
              title={grid.title}
              scale={this.props.scale}
              states={grid.states}
              workers={this.state?.workers[widx] || []}
              legendPosition={row.length === 1 ? "right" : "below"}
            />
          </Box>
        ))}
      </Box>
    ))
  }

  public render() {
    return (
      <Box flexDirection="column">
        {this.header()}
        {this.body()}
        {this.footer()}
      </Box>
    )
  }
}
