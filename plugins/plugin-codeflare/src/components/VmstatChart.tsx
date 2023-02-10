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
import { HostMap } from "../controller/charts/LogRecord"
import BaseChart, { BaseChartProps, TimeRange } from "./Chart"

type Props = TimeRange & {
  logs: HostMap<Log>
}

type State = {
  charts: BaseChartProps[]
}

export default class VmstatChart extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = {
      charts: this.charts(props),
    }
  }

  /** Format a Victory datum for the CPU Utilization time series */
  private readonly datumForSeries1 = (line: Log) => ({
    name: BaseChart.nodeNameLabel(line.hostname) + " CPU",
    x: line.timestamp - this.props.minTime,
    y: 100 - line.idle,
  })

  /** Format a Victory datum for the Free Memory time series */
  private readonly datumForSeries2 = (line: Log) => ({
    name: BaseChart.nodeNameLabel(line.hostname) + " Free Memory",
    x: line.timestamp - this.props.minTime,
    y: line.freeMemory,
  })

  /** Create a new chart for the given Log `lines` */
  private readonly newChart = ([node, lines]: [string, Log[]]): BaseChartProps => {
    const d1 = lines.map(this.datumForSeries1)
    const d2 = lines.map(this.datumForSeries2)

    const series = [
      { impl: "ChartArea" as const, stroke: BaseChart.colors[1], data: d1 },
      { impl: "ChartDashedLine" as const, stroke: BaseChart.colors[2], data: d2 },
    ]

    const data = series.map((_, idx) => BaseChart.normalize(_, idx === 0 ? "percentage" : "memory"))

    return {
      key: node,
      title: BaseChart.nodeNameLabel(node),
      desc: "Chart showing CPU utilization over time for " + node,
      series,
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
  }

  private charts(props: Props): BaseChartProps[] {
    return Object.entries(props.logs).map(this.newChart)
  }

  public render() {
    return <BaseChart charts={this.state.charts} minTime={this.props.minTime} maxTime={this.props.maxTime} />
  }
}
