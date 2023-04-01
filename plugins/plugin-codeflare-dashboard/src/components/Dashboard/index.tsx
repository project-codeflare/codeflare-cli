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
import { Box, Spacer, Text } from "ink"

import Grid from "./Grid.js"
import type { GridSpec, UpdatePayload } from "./types.js"

export type Props = {
  /** CodeFlare Profile for this dashboard */
  profile: string

  /** Job ID that this dashboard visualizes */
  jobId: string

  /** Scale up the grid? [default: 1] */
  scale?: number

  grids: (null | GridSpec)[]
}

export type State = {
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
      <Box borderStyle="singleDouble" flexDirection="column">
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
