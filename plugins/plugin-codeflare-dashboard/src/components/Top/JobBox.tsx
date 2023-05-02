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
import prettyBytes from "pretty-bytes"
import { Box, Text, TextProps } from "ink"

import type Group from "./Group.js"
import type { Breakdown, Resource } from "./types.js"

import { ValidResources } from "./types.js"

import { themes } from "../../controller/dashboard/job/utilization/theme.js"
import { defaultUtilizationThemes } from "../../controller/dashboard/job/grids.js"

type Props = {
  group: Group
  isSelected: boolean | "no-selection"
  min: Breakdown
}

/** Render one `group` (one job) */
export default class JobBox extends React.PureComponent<Props> {
  /** Text to use for one cell's worth of time */
  private readonly block = "■" // "▇"

  private get isSelected() {
    return this.props.isSelected === true
  }

  private get hasSelection() {
    return this.props.isSelected !== "no-selection"
  }

  private get name() {
    return this.props.group.job.name
  }

  private get ctime() {
    return this.props.group.ctime
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

  private styleOfGroup(baseStyle: TextProps): TextProps {
    return Object.assign({}, baseStyle, {
      dimColor: this.hasSelection && !this.isSelected,
    })
  }

  private styleOfGroupForResource(resource: Resource): TextProps {
    return this.styleOfGroup(this.styleOfResource(resource))
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
  private resourceLine(resource: Resource) {
    const unit = this.props.min[resource]
    const tot = this.props.group.stats.tot[resource]
    const amnt = tot / this.props.group.hosts.length
    const N = Math.round(amnt / unit)

    return this.nCells(
      N,
      "",
      "",
      this.styleOfGroupForResource(resource),
      this.format(amnt, resource) + "/node",
      resource
    )
  }

  private titleStyle(): TextProps {
    if (this.isSelected === true) {
      return {
        inverse: true,
      }
    } else if (this.hasSelection) {
      return { dimColor: true }
    } else {
      return { bold: true }
    }
  }

  private title() {
    return <Text {...this.titleStyle()}>{this.name.slice(0, 34) + (this.name.length > 34 ? "…" : "")}</Text>
  }

  private prettyPrintAge() {
    return prettyMillis(Date.now() - this.ctime, { unitCount: 2, secondsDecimalDigits: 0 }).padEnd(
      7 /* 'XXm YYs'.length */
    )
  }

  private header() {
    return (
      <Box>
        <Box flexGrow={1}>{this.title()}</Box>
        <Box justifyContent="flex-end" marginLeft={2}>
          <Text color="cyan">{this.prettyPrintAge()}</Text>
        </Box>
      </Box>
    )
  }

  private body() {
    const { hosts, pods, stats } = this.props.group

    return (
      <React.Fragment>
        {this.nCells(hosts.length, "node", "nodes", this.styleOfGroup({ color: "yellow" }))}
        {ValidResources.filter((resource) => stats.tot[resource] !== 0).map((resource) => this.resourceLine(resource))}
        {this.nCells(
          Math.round(pods.length / hosts.length),
          "worker/node",
          "workers/node",
          this.styleOfGroup({ color: "white" })
        )}
      </React.Fragment>
    )
  }

  public render() {
    return (
      <Box flexDirection="column" borderStyle={this.isSelected ? "bold" : "single"}>
        {this.header()}
        {this.body()}
      </Box>
    )
  }
}
