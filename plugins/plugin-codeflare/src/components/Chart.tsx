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
import {
  Chart,
  ChartProps,
  ChartAxis,
  ChartArea,
  ChartAreaProps,
  ChartAxisProps,
  ChartLine,
} from "@patternfly/react-charts"

type Format = "celsius" | "percentage" | "timestamp" | "memory"

export type Series = {
  impl: "ChartArea" | "ChartLine"
  color: string
  data: { name?: string; x: number; y: number }[]
}

export type BaseChartProps = Pick<ChartProps, "domain" | "padding"> & {
  title: string
  desc: string
  series: Series[]

  // y axis...
  yAxes: (
    | undefined
    | (Pick<ChartAreaProps, "y"> &
        Pick<ChartAxisProps, "tickValues" | "tickFormat" | "orientation" | "style"> & {
          label: string
          tickCount?: number
          format: Format
        })
  )[]
}

interface Props {
  charts: BaseChartProps[]
}

export default class BaseChart extends React.PureComponent<Props> {
  private readonly dimensions = {
    width: 400,
    height: 90,
  }

  public static readonly padding = {
    bottom: 25,
    left: 60,
    right: 25,
    top: 10,
  }

  public static readonly colors = [
    "var(--color-base04)",
    "var(--color-latency-3)",
    "var(--color-latency-1)",
    "var(--color-latency-4)",
  ]

  private static readonly labelColor = "var(--color-text-01)"
  private static readonly fontFamily = "var(--font-sans-serif)"

  public static readonly axisStyle: ChartAxisProps["style"] = {
    axisLabel: { fontSize: 10, fontFamily: BaseChart.fontFamily, fill: BaseChart.labelColor },
    tickLabels: { fontSize: 8, fontFamily: BaseChart.fontFamily, fill: BaseChart.labelColor },
  }

  public static readonly twoAxisStyle: ChartAxisProps["style"][] = [
    Object.assign({}, BaseChart.axisStyle || {}, {
      axisLabel: Object.assign({}, (BaseChart.axisStyle || {}).axisLabel, {
        fill: BaseChart.colors[1],
        fontWeight: "bold",
      }),
      tickLabels: Object.assign({}, (BaseChart.axisStyle || {}).tickLabels, { fill: BaseChart.colors[1] }),
    }),
    Object.assign({}, BaseChart.axisStyle, {
      axisLabel: Object.assign({}, (BaseChart.axisStyle || {}).axisLabel, { fill: BaseChart.colors[2] }),
      tickLabels: Object.assign({}, (BaseChart.axisStyle || {}).tickLabels, { fill: BaseChart.colors[2] }),
    }),
  ]

  private axisStyleWithGrid: ChartAxisProps["style"] = Object.assign({}, BaseChart.axisStyle, {
    grid: { strokeWidth: 1, stroke: BaseChart.colors[0] },
  })

  private static readonly formatters = {
    celsius: (value: number) => ~~value + "C",
    percentage: (value: number) => value + "%",
    memory: (value: number) => ~~(value / 1024 / 1024) + " GiB",
    timestamp: (timestamp: number) => new Date(timestamp).toLocaleTimeString(),
  }

  private readonly minDomain = {
    percentage: { y: 0 },
    celsius: undefined,
    timestamp: undefined,
    memory: undefined,
  }
  private readonly maxDomain = {
    percentage: { y: 100 },
    celsius: undefined,
    timestamp: undefined,
    memory: undefined,
  }

  private xAxis() {
    return (
      <ChartAxis scale="time" style={BaseChart.axisStyle} tickFormat={BaseChart.formatters.timestamp} tickCount={5} />
    )
  }

  private yAxis(axis: BaseChartProps["yAxes"][number]) {
    return (
      axis && (
        <ChartAxis
          key="yAxis"
          label={axis.label}
          dependentAxis
          orientation={axis.orientation}
          style={Object.assign({}, this.axisStyleWithGrid, axis.style || {})}
          tickFormat={axis.tickFormat || BaseChart.formatters[axis.format]}
          tickValues={axis.tickValues}
          tickCount={axis.tickCount}
        />
      )
    )
  }

  private areaStyle(color: string): ChartAreaProps["style"] {
    return { data: { stroke: color, fill: color } }
  }

  private lineStyle(color: string): ChartAreaProps["style"] {
    return { data: { stroke: color } }
  }

  private readonly minDomain0 = { y: 0 }
  private readonly maxDomain100 = { y: 100 }
  //        minDomain={chart.format === "percentage" ? this.minDomain0 : undefined}
  //      maxDomain={chart.format === "percentage" ? this.maxDomain100 : undefined}

  private chart(chart: BaseChartProps, idx: number) {
    return (
      <Chart
        key={idx}
        ariaTitle={chart.title}
        ariaDesc={chart.desc}
        padding={chart.padding || BaseChart.padding}
        width={this.dimensions.width}
        height={this.dimensions.height}
        domain={chart.domain}
      >
        {this.xAxis()}
        {chart.series.flatMap(({ impl, color, data }, idx) => {
          const yAxis =
            chart.yAxes[idx] ||
            chart.yAxes
              .slice(0, idx)
              .reverse()
              .find((_) => _ && _.y)
          const y = yAxis ? yAxis.y : undefined

          const props = {
            style: impl === "ChartArea" ? this.areaStyle(color) : this.lineStyle(color),
            data,
            y,
          }

          const chartui = impl === "ChartArea" ? <ChartArea key={idx} {...props} /> : <ChartLine key={idx} {...props} />

          if (chart.yAxes[idx]) {
            return [this.yAxis(chart.yAxes[idx]), chartui]
          } else {
            return [chartui]
          }
        })}
      </Chart>
    )
  }

  public static nodeNameLabel(node: string) {
    return node
      .slice(node.indexOf("-") + 1)
      .replace(/ray-|-type/g, "")
      .slice(0, 10)
  }

  public static normalize(
    series: Series,
    format: Format
  ): Pick<ChartAreaProps, "y"> & Pick<ChartAxisProps, "tickFormat" | "tickValues"> {
    const maxima: number = format === "percentage" ? 100 : series.data.reduce((max, d) => Math.max(max, d.y), 0)

    const y = (datum: object) => (maxima > 0 && hasY(datum) ? datum.y / maxima : 0)
    const tickFormat = (d: number) => BaseChart.formatters[format](d * maxima)
    const tickValues = [0.25, 0.5, 0.75, 1]

    return { y, tickFormat, tickValues }
  }

  public render() {
    return <div className="codeflare-chart-container">{this.props.charts.map(this.chart.bind(this))}</div>
  }
}

function hasY(datum: object): datum is { y: number } {
  const yish = datum as { y: number }
  return yish && typeof yish.y === "number"
}
