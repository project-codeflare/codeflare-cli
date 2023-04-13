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

import type { GridSpec, UpdatePayload, LogLineUpdate, TimestampedLine, WorkersUpdate, Worker } from "./types.js"

import Grid from "./Grid.js"
import Timeline from "./Timeline.js"
import { isWorkersUpdate } from "./types.js"

export type Props = {
  /** CodeFlare Profile for this dashboard */
  profile: string

  /** Job ID that this dashboard visualizes */
  jobId: string

  /** Scale up the grid? [default: 1] */
  scale?: number

  /** Grid models, where null means to insert a line break */
  grids: (null | GridSpec)[]
}

export type State = Pick<WorkersUpdate, "events"> &
  LogLineUpdate & {
    /** millis since epoch of the first update */
    firstUpdate: number

    /** millis since epoch of the last update */
    lastUpdate: number

    /** iteration count to help us keep "last updated ago" UI fresh */
    iter: number

    /** interval to keep "last updated ago" UI fresh */
    agoInterval: ReturnType<typeof setInterval>

    /** Controller that allows us to shut down gracefully */
    watchers: { quit: () => void }[]

    /**
     * Model of current workers; outer idx is grid index; inner idx is
     * worker idx, i.e. for each grid, we have an array of Workers.
     */
    workers: Worker[][]
  }

export default class Dashboard extends React.PureComponent<Props, State> {
  public componentDidMount() {
    this.setState({
      workers: [],
      watchers: this.gridModels.map((props, gridIdx) => props.initWatcher((model) => this.onUpdate(gridIdx, model))),
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

  /** Helps with debouncing updates of WorkersUpdate */
  private updateDebounce1: (null | ReturnType<typeof setTimeout>)[] = []

  /** Helps with debouncing updates of LogLineUpdate */
  private updateDebounce2: (null | ReturnType<typeof setTimeout>)[] = []

  /** We have received an update from a `GridSpec.initWatcher` */
  private readonly onUpdate = (gridIdx: number, model: UpdatePayload) => {
    // to avoid a flurry of renders, we do some debouncing here
    const bouncies = isWorkersUpdate(model) ? this.updateDebounce1 : this.updateDebounce2
    const bouncey = bouncies[gridIdx]
    if (bouncey !== null) clearTimeout(bouncey)

    bouncies[gridIdx] = setTimeout(
      () =>
        this.setState((curState) => ({
          lastUpdate: Date.now(), // TODO pull from the events
          firstUpdate: (curState && curState.firstUpdate) || Date.now(), // TODO pull from the events

          logLine: !isWorkersUpdate(model) ? model.logLine : curState?.logLine,

          events: !isWorkersUpdate(model)
            ? curState?.events
            : !model.events || model.events.length === 0
            ? curState?.events
            : model.events,

          workers: !isWorkersUpdate(model)
            ? curState?.workers
            : !curState?.workers
            ? [model.workers] // i think this is wrong. don't we need to preserve indexing?
            : [...curState.workers.slice(0, gridIdx), model.workers.slice(), ...curState.workers.slice(gridIdx + 1)],
          //                                                       ^^^^^^^ ugh, we could optimize this to check for changes
        })),
      0
    )
  }

  /** @return the grid models, excluding the `null` linebreak indicators */
  private get gridModels(): GridSpec[] {
    // typescript@4.9 does not seem to be smart enough here, hence the
    // type conversion :(
    return this.props.grids.filter((_) => _ !== null) as GridSpec[]
  }

  /** @return current `events` model */
  private get events(): State["events"] {
    return this.state?.events
  }

  /** @return current `logLine` model */
  private get logLine(): State["logLine"] {
    return this.state?.logLine
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
      <Box flexDirection="column">
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

  /** @return pretty-printed milliseconds delta as e.g. "5m ago" */
  private ago(millisDelta: number): string {
    return prettyMillis(millisDelta, { compact: true }) + " ago"
  }

  /** @return pretty-printed millis since epoch as delta from this moment in time e.g. "5m ago" */
  private agos(millis: number) {
    return this.ago(Date.now() - millis)
  }

  /**
   * The controller (controller/dashboard/utilization/Live) leaves a
   * {timestamp} breadcrumb in the raw line text, so that we,as the
   * view, can inject a "5m ago" text, while preserving the ansi
   * formatting that surrounds the timestamp.
   */
  private readonly textForLine = ({ line, timestamp }: TimestampedLine) => {
    const txt = line.replace("{timestamp}", () => this.agos(timestamp))
    return <Text key={txt}>{txt}</Text>
  }

  /** Render log lines and events */
  private footer() {
    if (!this.events && !this.logLine) {
      return <React.Fragment />
    } else {
      const eventRows = (this.events || []).map(this.textForLine)

      const logLineRows = (this.logLine ? this.logLine : []).map(this.textForLine)

      return (
        <React.Fragment>
          {eventRows.length === 0 ? (
            <React.Fragment />
          ) : (
            <Box marginTop={1} flexDirection="column">
              {eventRows}
            </Box>
          )}

          {logLineRows.length === 0 ? (
            <React.Fragment />
          ) : (
            <Box marginTop={1} flexDirection="column">
              {logLineRows}
            </Box>
          )}
        </React.Fragment>
      )
    }
  }

  /**
   * We allow the controller to break the grids into rows via a `null`
   * entry. This method performs that row decomposition, it does not
   * do any react rendering.
   */
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

  /** Render the grids */
  private grids() {
    return this.gridRows().map((row, ridx) => (
      <Box key={ridx} justifyContent="space-around">
        {row.map(({ grid, widx }) => (
          <Box key={grid.title} marginLeft={1}>
            <Grid
              key={grid.title}
              title={grid.title}
              scale={this.props.scale}
              states={grid.states}
              isQualitative={grid.isQualitative}
              workers={this.state?.workers[widx] || []}
              legendPosition={row.length === 1 ? "right" : "below"}
            />
          </Box>
        ))}
      </Box>
    ))
  }

  /** Render the grids and timelines */
  private body() {
    return (
      <Box flexDirection="column">
        {this.grids()}
        <Timeline gridModels={this.gridModels} workers={this.state?.workers} />
      </Box>
    )
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
