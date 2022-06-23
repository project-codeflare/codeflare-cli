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
import { Chart, ChartAxis, ChartArea, ChartAreaProps, ChartAxisProps } from "@patternfly/react-charts"
import { Log } from "../types"

import "../../web/scss/components/Dashboard/Charts.scss"

type Props = {
  logs: Log[]
}

export default class GPUChart extends React.PureComponent<Props> {
  private readonly colors = [
    "var(--color-base04)",
    "var(--color-latency-3)",
    "var(--color-latency-1)",
    "var(--color-latency-4)",
  ]
  private readonly labelColor = "var(--color-text-01)"
  private readonly fontFamily = "var(--font-sans-serif)"

  private readonly axisStyle: ChartAxisProps["style"] = {
    tickLabels: { fontSize: 9, fontFamily: this.fontFamily, fill: this.labelColor },
    axisLabel: { fontSize: 11, fontFamily: this.fontFamily, fill: this.labelColor },
  }

  private axisStyleWithGrid: ChartAxisProps["style"] = Object.assign({}, this.axisStyle, {
    grid: { strokeWidth: 1, stroke: this.colors[0] },
  })

  private readonly padding = {
    bottom: 25,
    left: 60,
    right: 25,
    top: 10,
  }

  private readonly styles = {
    utilizationMemory: this.style(this.colors[1]),
    utilizationGPU: this.style(this.colors[2]),
    temperatureGPU: this.style(this.colors[3]),
    cluster: undefined,
    timestamp: undefined,
    gpuType: undefined,
    totalMemory: undefined,
  }

  private readonly dimensions = {
    width: 400,
    height: 90,
  }

  private readonly formatters = {
    celsius: (value: number) => value + "C",
    percentage: (value: number) => value + "%",
    timestamp: (timestamp: number) => `${new Date(timestamp).getHours()}:${new Date(timestamp).getMinutes()}`,
  }

  private readonly minDomain = {
    percentage: { y: 0 },
    celsius: undefined,
    timestamp: undefined,
  }
  private readonly maxDomain = {
    percentage: { y: 100 },
    celsius: undefined,
    timestamp: undefined,
  }

  private xAxis() {
    return (
      <ChartAxis
        scale="time"
        style={this.axisStyle}
        tickValues={this.props.logs.map((item) => item.timestamp)}
        tickFormat={this.formatters.timestamp}
        tickCount={5}
      />
    )
  }

  private style(color: string): ChartAreaProps["style"] {
    return { data: { stroke: color, fill: color } }
  }

  private chart(
    title: string,
    desc: string,
    label: string,
    formatter: keyof typeof this.formatters,
    series: keyof Log,
    tickCount?: number
  ) {
    return (
      <Chart
        ariaTitle={title}
        ariaDesc={desc}
        height={this.dimensions.height}
        width={this.dimensions.width}
        maxDomain={this.maxDomain[formatter]}
        minDomain={this.minDomain[formatter]}
        padding={this.padding}
      >
        <ChartAxis
          label={label}
          dependentAxis
          style={this.axisStyleWithGrid}
          tickFormat={this.formatters[formatter]}
          tickCount={tickCount}
        />
        {this.xAxis()}
        <ChartArea
          style={this.styles[series]}
          data={this.props.logs.map((log) => ({
            name: log.gpuType,
            x: log.timestamp,
            y: log[series],
          }))}
        />
      </Chart>
    )
  }

  public render() {
    return (
      <div className="codeflare-chart-container">
        {this.chart(
          "GPU Utilization",
          "Chart showing GPU utilization over time",
          "Utilization",
          "percentage",
          "utilizationGPU"
        )}
        {this.chart(
          "GPU Memory Utilization",
          "Chart showing GPU memory utilization over time",
          "Memory",
          "percentage",
          "utilizationMemory"
        )}
        {this.chart(
          "GPU Temperature",
          "Chart showing GPU temperature over time",
          "Temperature",
          "celsius",
          "temperatureGPU",
          3
        )}
      </div>
    )
  }
}
