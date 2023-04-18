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

import Debug from "debug"
import React from "react"
import prettyMillis from "pretty-ms"
import prettyBytes from "pretty-bytes"
import { emitKeypressEvents } from "readline"
import { Box, Text, TextProps, render } from "ink"

import type { JobRec, HostRec, PodRec, OnData, UpdatePayload, Resource, ResourceSpec } from "./types.js"

import defaultValueFor from "./defaults.js"
import { Breakdown, ValidResources } from "./types.js"

import { themes } from "../../controller/dashboard/job/utilization/theme.js"
import { defaultUtilizationThemes } from "../../controller/dashboard/job/grids.js"

type UI = {
  /** Force a refresh */
  refreshCycle?: number
}

type Props = UI & {
  initWatcher: (cb: OnData) => void
}

type Group = {
  groupIdx: number
  job: JobRec
  ctime: number
  hosts: HostRec[]
  pods: PodRec[]
  stats: { min: Breakdown; tot: Breakdown }
}

type State = UI & {
  /** Model from controller */
  rawModel: UpdatePayload

  /** Our grouping of `rawModel` */
  groups: Group[]

  /** Currently selected group */
  selectedGroupIdx: number

  /** Refresh interval so we can update durations */
  refreshCycle: number

  /** Refresher interval */
  refresher: ReturnType<typeof setInterval>
}

class Top extends React.PureComponent<Props, State> {
  /** Text to use for one cell's worth of time */
  private readonly block = "■" // "▇"

  /**
   * % is remainder, we want modulo
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
   */
  private mod(n: number, d: number) {
    return ((n % d) + d) % d
  }

  public componentDidMount() {
    this.props.initWatcher(this.onData)
    this.initRefresher()
    this.initKeyboardEvents()
  }

  public componentWillUnmount() {
    this.cleanupRefresher()
    this.cleanupKeyboardEvents()
  }

  /** So we can update the job age UI even without updates from the controller */
  private initRefresher() {
    this.setState({
      refresher: setInterval(
        () => this.setState((curState) => ({ refreshCycle: (curState?.refreshCycle || 0) + 1 })),
        10000
      ),
    })
  }

  private cleanupRefresher() {
    if (this.state?.refresher) {
      clearInterval(this.state.refresher)
    }
  }

  private cleanupKeyboardEvents() {
    // TODO do we also need to exit raw mode on ctrl+c?
    process.stdin.setRawMode(false)
  }

  /** Handle keyboard events from the user */
  private initKeyboardEvents() {
    // these are necessary to get keypress events on process.stdin
    emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)

    process.stdin.on("keypress", (str, key) => {
      if (key.ctrl && key.name === "c") {
        process.exit()
      } else if (key.ctrl && key.name === "l") {
        this.setState((curState) => ({ refreshCycle: (curState?.refreshCycle || 0) + 1 }))
      } else {
        switch (key.name) {
          case "escape":
            this.setState({ selectedGroupIdx: -1 })
            break
          case "left":
          case "right":
            if (this.state.groups) {
              const incr = key.name === "left" ? -1 : 1
              this.setState((curState) => ({
                selectedGroupIdx:
                  curState?.selectedGroupIdx === undefined
                    ? 0
                    : this.mod(curState.selectedGroupIdx + incr, curState.groups.length + 1),
              }))
            }
            break
          /*case "i":
            this.setState((curState) => ({ blockCells: !this.useBlocks(curState) }))
            break*/
          /*case "g":
            this.setState((curState) => ({
              groupHosts: !this.groupHosts(curState),
              groups: !curState?.rawModel
                ? curState?.groups
                : this.groupBy(curState.rawModel, !this.groupHosts(curState)),
            }))
            break */
        }
      }
    })
  }

  /** We have received data from the controller */
  private readonly onData = (rawModel: UpdatePayload) =>
    this.setState((curState) => {
      if (JSON.stringify(curState?.rawModel) === JSON.stringify(rawModel)) {
        return null
      } else {
        return { rawModel, groups: this.groupBy(rawModel) }
      }
    })

  private groupBy(model: UpdatePayload): State["groups"] {
    return Object.values(
      model.hosts.reduce((M, host) => {
        host.jobs.forEach((job) => {
          const key = job.name
          if (!M[key]) {
            M[key] = {
              job,
              ctime: Date.now(),
              hosts: [],
              pods: [],
              stats: { min: model.stats.min, tot: { cpu: 0, mem: 0, gpu: 0 } },
            }
          }

          M[key].hosts.push(host)
          M[key].pods = [...M[key].pods, ...job.pods]
          M[key].ctime = Math.min(M[key].ctime, ...job.pods.map((_) => _.ctime))
          M[key].stats.tot.cpu += job.pods.reduce((tot, pod) => (tot += this.mostOf(pod.cpu, defaultValueFor.cpu)), 0)
          M[key].stats.tot.mem += job.pods.reduce((tot, pod) => (tot += this.mostOf(pod.mem, defaultValueFor.mem)), 0)
          M[key].stats.tot.gpu += job.pods.reduce((tot, pod) => (tot += this.mostOf(pod.gpu, defaultValueFor.gpu)), 0)
        })

        return M
      }, {} as Record<string, Omit<State["groups"][number], "groupIdx">>)
    )
      .sort(this.sorter)
      .map((group, groupIdx) => Object.assign(group, { groupIdx }))
  }

  private readonly sorter = (a: Omit<Group, "groupIdx">, b: Omit<Group, "groupIdx">) => {
    return (
      a.stats.tot.cpu + a.stats.tot.mem + a.stats.tot.gpu - (b.stats.tot.cpu + b.stats.tot.mem + b.stats.tot.gpu) ||
      a.job.name.localeCompare(b.job.name)
    )
  }

  private longestHostName(hosts: HostRec[]) {
    return hosts.reduce((max, { host }) => Math.max(max, host.length), 0)
  }

  private format(quantity: number, resource: Resource) {
    switch (resource) {
      case "cpu": {
        const formattedQuantity =
          quantity < 1000 ? `${quantity}m` : (quantity / 1000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")
        return formattedQuantity + " " + (formattedQuantity === "1" ? "cpu" : "cpus")
      }
      case "mem":
        return prettyBytes(quantity, { space: false })
      default:
      case "gpu":
        return quantity + " gpus"
    }
  }

  /** Do we have a selected group? */
  private get hasSelection() {
    return this.state?.selectedGroupIdx >= 0 && this.state?.selectedGroupIdx < this.state.groups.length
  }

  private styleOfResource(resource: Resource): TextProps {
    switch (resource) {
      case "cpu":
        return themes[defaultUtilizationThemes["cpu%"]][2]

      case "mem":
        return themes[defaultUtilizationThemes["mem%"]][2]

      default:
      case "gpu":
        return themes[defaultUtilizationThemes["gpu%"]][2]
    }
  }

  private styleOfGroup(group: Group, baseStyle: TextProps): TextProps {
    return Object.assign({}, baseStyle, {
      dimColor: this.hasSelection && this.state?.selectedGroupIdx !== group.groupIdx,
    })
  }

  private styleOfGroupForResource(group: Group, resource: Resource): TextProps {
    return this.styleOfGroup(group, this.styleOfResource(resource))
  }

  private mostOf({ request, limit }: ResourceSpec, defaultValue: number) {
    if (request === -1 && limit === -1) {
      return defaultValue
    } else if (request === -1) {
      return limit
    } else if (limit === -1) {
      return request
    } else {
      return Math.max(request, limit)
    }
  }

  /** Render a number of cells in a line */
  private nCells(
    N: number,
    labelSingular: string,
    labelPlural: string,
    style: TextProps,
    value: number | string = N,
    key = labelSingular
  ) {
    return (
      <Box key={key}>
        <Box marginRight={1}>
          {Array(N)
            .fill(0)
            .map((_, idx) => (
              <Text key={idx} {...style}>
                {this.block}
              </Text>
            ))}
        </Box>
        <Box flexWrap="nowrap">
          <Text {...style}>
            {value} {value === 1 ? labelSingular : labelPlural}
          </Text>
        </Box>
      </Box>
    )
  }

  /** Render cells for one `resource` for one `group` */
  private resourceLine(group: Group, resource: Resource) {
    const unit = this.state.rawModel.stats.min[resource]
    const tot = group.stats.tot[resource]
    const amnt = tot / group.hosts.length
    const N = Math.round(amnt / unit)

    return this.nCells(
      N,
      "",
      "",
      this.styleOfGroupForResource(group, resource),
      this.format(amnt, resource) + "/node",
      resource
    )
  }

  /** Render one `group` (one job) */
  private group(group: Group, groupIdx: number) {
    const isSelected = this.state.selectedGroupIdx === groupIdx

    const titleStyle: TextProps = isSelected
      ? {
          inverse: true,
        }
      : this.hasSelection
      ? { dimColor: true }
      : { bold: true }

    return (
      <Box key={group.job.name} flexDirection="column" borderStyle={isSelected ? "bold" : "single"}>
        <Box>
          <Box flexGrow={1}>
            <Text {...titleStyle}>{group.job.name.slice(0, 34) + (group.job.name.length > 34 ? "…" : "")}</Text>
          </Box>
          <Box justifyContent="flex-end" marginLeft={2}>
            <Text color="cyan">
              {
                prettyMillis(Date.now() - group.ctime, { unitCount: 2, secondsDecimalDigits: 0 }).padEnd(
                  7
                ) /* 'XXm YYs'.length */
              }
            </Text>
          </Box>
        </Box>

        {this.nCells(group.hosts.length, "node", "nodes", this.styleOfGroup(group, { color: "yellow" }))}
        {ValidResources.filter((resource) => group.stats.tot[resource] !== 0).map((resource) =>
          this.resourceLine(group, resource)
        )}
        {this.nCells(
          group.pods.length / group.hosts.length,
          "worker/node",
          "workers/node",
          this.styleOfGroup(group, { color: "white" })
        )}
      </Box>
    )
  }

  public render() {
    if (!this.state?.groups) {
      // TODO spinner? this means we haven't received the first data set, yet
      return <React.Fragment />
    } else if (this.state.groups.length === 0) {
      return <Text>No active jobs</Text>
    } else {
      return <Box flexWrap="wrap">{this.state.groups.map((_, idx) => this.group(_, idx))}</Box>
    }
  }
}

export default async function renderTop(props: Props) {
  const debug = Debug("plugin-codeflare-dashboard/components/Top")

  debug("rendering")
  const { waitUntilExit } = await render(<Top {...props} />)
  debug("initial render done")
  await waitUntilExit()
}
