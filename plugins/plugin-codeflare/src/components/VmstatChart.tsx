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

import React from "react"

import { Log } from "../controller/charts/vmstat"
import BaseChart, { BaseChartProps } from "./Chart"
import { HostMap } from "../controller/charts/LogRecord"

type Props = {
  logs: HostMap<Log>
}

type State = {
  charts: BaseChartProps[]
}

export default class VmstatChart extends React.PureComponent<Props, State> {
  private static readonly padding = Object.assign({}, BaseChart.padding, {
    right: BaseChart.padding.left,
  })

  public constructor(props: Props) {
    super(props)
    this.state = {
      charts: VmstatChart.charts(props),
    }
  }

  private static charts(props: Props): BaseChartProps[] {
    const earliestTimestamp: number = Object.values(props.logs).reduce(
      (min, logs) => logs.reduce((min, line) => Math.min(min, line.timestamp), Number.MAX_VALUE),
      Number.MAX_VALUE
    )

    return Object.entries(props.logs).map(([node, lines]) => {
      const d1 = lines.map((line) => ({
        name: BaseChart.nodeNameLabel(node) + " CPU Utilization",
        x: line.timestamp - earliestTimestamp,
        y: 100 - line.idle,
      }))

      const d2 = lines.map((line) => ({
        name: BaseChart.nodeNameLabel(node) + " Free Memory",
        x: line.timestamp - earliestTimestamp,
        y: line.freeMemory,
      }))

      const series = [
        { impl: "ChartArea" as const, stroke: BaseChart.colors[1], data: d1 },
        { impl: "ChartLine" as const, stroke: BaseChart.colors[2], data: d2 },
      ]

      const data = series.map((_, idx) => BaseChart.normalize(_, idx === 0 ? "percentage" : "memory"))

      return {
        title: BaseChart.nodeNameLabel(node),
        desc: "Chart showing CPU utilization over time for " + node,
        series,
        padding: VmstatChart.padding,
        yAxes: [
          {
            label: "CPU",
            format: "percentage",
            y: data[0].y,
            tickFormat: data[0].tickFormat,
            tickValues: data[0].tickValues,
            style: BaseChart.twoAxisStyle[0],
          },
          {
            label: "Free Memory",
            format: "memory",
            orientation: "right",
            y: data[1].y,
            tickFormat: data[1].tickFormat,
            tickValues: data[1].tickValues,
            style: BaseChart.twoAxisStyle[1],
          },
        ],
      }
    })
  }

  public render() {
    return <BaseChart charts={this.state.charts} />
  }
}
