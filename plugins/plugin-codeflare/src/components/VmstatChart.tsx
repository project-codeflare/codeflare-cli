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

import BaseChart, { BaseChartProps, Series } from "./Chart"
import { Log } from "../controller/charts/vmstat"

type Props = {
  logs: Log[]
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
    const earliestTimestamp = props.logs.reduce((min, line) => Math.min(min, line.timestamp), Number.MAX_VALUE)

    const perNodeData = props.logs.reduce((M, line) => {
      if (!M[line.hostname]) {
        M[line.hostname] = [
          { impl: "ChartArea", stroke: BaseChart.colors[1], data: [] },
          { impl: "ChartLine", stroke: BaseChart.colors[2], data: [] },
        ]
      }

      M[line.hostname][0].data.push({
        name: BaseChart.nodeNameLabel(line.hostname) + " CPU Utilization",
        x: line.timestamp - earliestTimestamp,
        y: 100 - line.idle,
      })

      M[line.hostname][1].data.push({
        name: BaseChart.nodeNameLabel(line.hostname) + " Free Memory",
        x: line.timestamp - earliestTimestamp,
        y: line.freeMemory,
      })

      return M
    }, {} as Record<string, Series[]>)

    return Object.keys(perNodeData).map((node) => {
      const series = perNodeData[node]
      const data = series.map((_, idx) => BaseChart.normalize(_, idx === 0 ? "percentage" : "memory"))

      return {
        title: BaseChart.nodeNameLabel(node),
        desc: "Chart showing CPU utilization over time for " + node,
        series,
        padding: VmstatChart.padding,
        yAxes: [
          {
            label: "Utilization",
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
