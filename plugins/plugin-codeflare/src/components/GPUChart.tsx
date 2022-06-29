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

import { Log } from "../controller/charts/gpu"
import { HostMap } from "../controller/charts/LogRecord"
import BaseChart, { BaseChartProps, TimeRange } from "./Chart"

type Props = TimeRange & {
  logs: HostMap<Log>
}

type State = {
  charts: BaseChartProps[]
}

export default class GPUChart extends React.PureComponent<Props, State> {
  private static readonly padding = Object.assign({}, BaseChart.padding, {
    right: BaseChart.padding.left,
  })

  public constructor(props: Props) {
    super(props)
    this.state = {
      charts: GPUChart.charts(props),
    }
  }

  private static charts(props: Props): BaseChartProps[] {
    return Object.entries(props.logs).map(([node, lines]) => {
      const d1 = lines.map((line) => ({
        name: BaseChart.nodeNameLabel(node) + " GPU Utilization",
        x: line.timestamp - props.timeRange.min,
        y: line.utilizationGPU,
      }))

      const d2 = lines.map((line) => ({
        name: BaseChart.nodeNameLabel(node) + " GPU Memory Utilization",
        x: line.timestamp - props.timeRange.min,
        y: line.utilizationMemory,
      }))

      const d3 = lines.map((line) => ({
        name: BaseChart.nodeNameLabel(node) + " GPU Temperature",
        x: line.timestamp - props.timeRange.min,
        y: line.temperatureGPU,
      }))

      const series = [
        { impl: "ChartArea" as const, stroke: BaseChart.colors[1], data: d1 },
        { impl: "ChartLine" as const, stroke: BaseChart.colors[2], data: d2 },
        { impl: "ChartDashedLine" as const, stroke: BaseChart.colors[3], data: d3 },
      ]

      const data = series.map((_, idx) => BaseChart.normalize(_, idx !== 2 ? "percentage" : "celsius"))

      return {
        title: BaseChart.nodeNameLabel(node),
        desc: "Chart showing GPU utilization over time",
        padding: GPUChart.padding,
        yAxes: [
          {
            label: "GPU",
            format: "percentage",
            y: data[0].y,
            tickFormat: data[0].tickFormat,
            tickValues: data[0].tickValues,
            style: BaseChart.twoAxisStyle[0],
          },
          /*{
            label: "Free Memory",
            format: "percentage",
            orientation: "right",
            y: data[1].y,
            tickFormat: data[1].tickFormat,
            tickValues: data[1].tickValues,
            style: BaseChart.twoAxisStyle[1],
            },*/
          undefined,
          {
            label: "Temperature",
            format: "celsius",
            orientation: "right",
            tickCount: 3,
            y: data[2].y,
            tickFormat: data[2].tickFormat,
            tickValues: data[2].tickValues,
            style: BaseChart.twoAxisStyle[2],
          },
        ],
        series,
      }
    })
  }

  public render() {
    return <BaseChart charts={this.state.charts} timeRange={this.props.timeRange} />
  }
}
