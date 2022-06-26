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
import BaseChart, { BaseChartProps, Series } from "./Chart"

type Props = {
  logs: Log[]
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

  private static data(field: "utilizationGPU" | "utilizationMemory" | "temperatureGPU", props: Props) {
    return props.logs.map((log) => ({
      name: log.gpuType,
      x: log.timestamp,
      y: log[field],
    }))
  }

  private static charts(props: Props): BaseChartProps[] {
    const earliestTimestamp = props.logs.reduce((min, line) => Math.min(min, line.timestamp), Number.MAX_VALUE)

    const perNodeData = props.logs.reduce((M, line) => {
      if (!M[line.cluster]) {
        M[line.cluster] = [
          { impl: "ChartArea", stroke: BaseChart.colors[1], data: [] },
          { impl: "ChartLine", stroke: BaseChart.colors[2], data: [] },
          { impl: "ChartDashedLine", stroke: BaseChart.colors[3], data: [] },
        ]
      }

      M[line.cluster][0].data.push({
        name: BaseChart.nodeNameLabel(line.cluster) + " GPU Utilization",
        x: line.timestamp - earliestTimestamp,
        y: line.utilizationGPU,
      })

      M[line.cluster][1].data.push({
        name: BaseChart.nodeNameLabel(line.cluster) + " GPU Memory Utilization",
        x: line.timestamp - earliestTimestamp,
        y: line.utilizationMemory,
      })

      M[line.cluster][2].data.push({
        name: BaseChart.nodeNameLabel(line.cluster) + " GPU Temperature",
        x: line.timestamp - earliestTimestamp,
        y: line.temperatureGPU,
      })

      return M
    }, {} as Record<string, Series[]>)

    return Object.keys(perNodeData).map((node) => {
      const series = perNodeData[node]
      const data = series.map((_, idx) => BaseChart.normalize(_, idx !== 2 ? "percentage" : "celsius"))

      return {
        title: BaseChart.nodeNameLabel(node),
        desc: "Chart showing GPU utilization over time",
        padding: GPUChart.padding,
        yAxes: [
          {
            label: "GPU Utilization",
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
    return <BaseChart charts={this.state.charts} />
  }
}
