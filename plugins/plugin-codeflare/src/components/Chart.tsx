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
import { Tile } from "@patternfly/react-core"

import {
  Chart,
  ChartProps,
  ChartAxis,
  ChartArea,
  ChartAreaProps,
  ChartAxisProps,
  ChartLabel,
  ChartLabelProps,
  ChartLine,
  ChartLineProps,
  ChartTooltip,
  ChartVoronoiContainer,
} from "@patternfly/react-charts"

import "../../web/scss/components/Dashboard/Charts.scss"

type Format = "celsius" | "percentage" | "timestamp" | "memory"

export type Series = {
  impl: "ChartArea" | "ChartLine" | "ChartDashedLine"
  stroke: string
  fill?: string
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
  private static fontSize = 9
  private static tickLabelFontSize = BaseChart.fontSize - 1

  private static readonly dimensions = {
    width: 120,
    height: 160,
  }

  public static readonly padding = {
    bottom: BaseChart.fontSize * 1.5,
    top: BaseChart.fontSize * 4,
    left: BaseChart.fontSize * 3.5,
    right: BaseChart.fontSize * 4,
  }

  public static readonly colors = [
    "var(--color-base04)",
    "var(--color-latency-0)",
    "var(--color-latency-1)",
    "var(--color-latency-2)",
    "var(--color-latency-3)",
    "var(--color-latency-4)",
    "var(--color-latency-5)",
  ]

  private static readonly labelColor = "var(--color-text-01)"
  private static readonly fontFamily = "var(--font-sans-serif)"

  public static readonly axisStyle: ChartAxisProps["style"] = {
    ticks: { strokeOpacity: 0 },
    tickLabels: {
      fontSize: BaseChart.tickLabelFontSize,
      fontFamily: BaseChart.fontFamily,
      fill: BaseChart.labelColor,
      padding: 0,
    },
    axisLabel: {
      fontSize: BaseChart.fontSize,
      fontFamily: BaseChart.fontFamily,
      fill: BaseChart.labelColor,
      padding: BaseChart.fontSize * 3.5,
    },
  }

  public static readonly twoAxisStyle: ChartAxisProps["style"][] = [
    Object.assign({}, BaseChart.axisStyle || {}, {
      tickLabels: Object.assign({}, (BaseChart.axisStyle || {}).tickLabels, { fill: BaseChart.colors[1] }),
    }),
    Object.assign({}, BaseChart.axisStyle, {
      tickLabels: Object.assign({}, (BaseChart.axisStyle || {}).tickLabels, { fill: BaseChart.colors[2] }),
    }),
    Object.assign({}, BaseChart.axisStyle, {
      tickLabels: Object.assign({}, (BaseChart.axisStyle || {}).tickLabels, { fill: BaseChart.colors[3] }),
    }),
  ]

  private static axisLabelStyle(
    fill: string,
    fontSize = BaseChart.fontSize,
    fontStyle = "italic",
    fontWeight = 500
  ): ChartLabelProps["style"] {
    return { fontSize, fontStyle, fontWeight, fill }
  }

  private static titleStyle(
    fontSize = BaseChart.fontSize,
    fill = "var(--color-text-01)",
    fontWeight = 600,
    fontStyle = "normal"
  ): ChartLabelProps["style"] {
    return { fontSize, fontStyle, fontWeight, fill }
  }

  private axisStyleWithGrid: ChartAxisProps["style"] = Object.assign({}, BaseChart.axisStyle, {
    grid: { strokeWidth: 1, stroke: "var(--color-text-02)", strokeOpacity: 0.15 },
  })

  private static readonly titlePosition = {
    x: {
      left: BaseChart.padding.left - BaseChart.tickLabelFontSize * 4,
      right: BaseChart.dimensions.width - BaseChart.tickLabelFontSize * 1.5,
    },
    y: BaseChart.padding.top - BaseChart.fontSize * 2,
  }

  private static readonly formatters = {
    celsius: (value: number) => ~~value + "C",
    percentage: (value: number) => value + "%",
    memory: (value: number) => ~~(value / 1024 / 1024) + " GiB",
    timestamp: (timestamp: number) =>
      timestamp < 60 * 3 * 1000 ? (timestamp / 1000).toFixed(0) + "s" : (timestamp / 1000 / 60).toFixed(1) + "m",
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
    // TODO, factor this out into a State variable?
    const { min, max } = this.props.charts.reduce(
      (M, chart) =>
        chart.series.reduce(
          (M, series) =>
            series.data.reduce((M, point) => {
              M.min = Math.min(M.min, point.x)
              M.max = Math.max(M.max, point.x)
              return M
            }, M),
          M
        ),
      { min: Number.MAX_VALUE, max: Number.MIN_VALUE }
    )

    return (
      <ChartAxis
        scale="time"
        style={BaseChart.axisStyle}
        tickFormat={BaseChart.formatters.timestamp}
        tickValues={[(max - min) / 4, max]}
      />
    )
  }

  private yAxis(axis: BaseChartProps["yAxes"][number]) {
    if (axis) {
      // re: the + BaseChart.fontSize * N: shift the axis labels over a bit, to overlap with the ticks
      const x = axis.orientation === "right" ? BaseChart.titlePosition.x.right : BaseChart.titlePosition.x.left

      const labelColor =
        axis.style && axis.style.tickLabels && typeof axis.style.tickLabels.fill === "string"
          ? axis.style.tickLabels.fill
          : "var(--color-text-01)"

      const axisLabelUI = (
        <ChartLabel
          key="yAxisLabel"
          x={x}
          y={BaseChart.titlePosition.y}
          style={BaseChart.axisLabelStyle(labelColor)}
          textAnchor={axis.orientation === "right" ? "end" : "start"}
          text={axis.label}
        />
      )

      const axisUI = (
        <ChartAxis
          key="yAxis"
          dependentAxis
          orientation={axis.orientation}
          style={Object.assign({}, this.axisStyleWithGrid, axis.style || {})}
          tickFormat={axis.tickFormat || BaseChart.formatters[axis.format]}
          tickValues={axis.tickValues}
          tickCount={axis.tickCount}
        />
      )

      return [axisLabelUI, axisUI]
    } else {
      return []
    }
  }

  private areaStyle(stroke: string, fill: string, strokeWidth = 1.25, fillOpacity = 0.1): ChartAreaProps["style"] {
    return { data: { stroke, strokeWidth, fill, fillOpacity } }
  }

  private lineStyle(stroke: string, strokeDasharray = "", strokeWidth = 1.25): ChartLineProps["style"] {
    return { data: { stroke, strokeWidth, strokeDasharray } }
  }

  private lineDashStyle(stroke: string): ChartLineProps["style"] {
    return this.lineStyle(stroke, "3,0.5", 2)
  }

  private chart(chart: BaseChartProps, idx: number) {
    // ariaTitle={chart.title}
    return (
      <Tile className="codeflare-chart-container" key={idx} title={chart.title}>
        <Chart
          ariaDesc={chart.desc}
          padding={chart.padding || BaseChart.padding}
          width={BaseChart.dimensions.width}
          height={BaseChart.dimensions.height}
          domain={chart.domain}
          containerComponent={
            <ChartVoronoiContainer
              voronoiDimension="x"
              constrainToVisibleArea
              labels={({ datum }) => `${datum.name.replace(/^\S+\s*/, "")}: ${datum.y}`}
              labelComponent={
                <ChartTooltip
                  style={{ fontSize: BaseChart.fontSize, fill: "var(--color-text-01)", textAnchor: "end" }}
                  flyoutStyle={{ fill: "var(--color-base00)", strokeWidth: 0.5, stroke: "var(--color-base02)" }}
                />
              }
            />
          }
        >
          {this.xAxis()}
          {chart.series.flatMap(({ impl, stroke, fill = stroke, data }, idx) => {
            const yAxis =
              chart.yAxes[idx] ||
              chart.yAxes
                .slice(0, idx)
                .reverse()
                .find((_) => _ && _.y)
            const y = yAxis ? yAxis.y : undefined

            const props = {
              style:
                impl === "ChartArea"
                  ? this.areaStyle(stroke, fill)
                  : impl === "ChartLine"
                  ? this.lineStyle(fill)
                  : this.lineDashStyle(fill),
              data,
              y,
            }

            const chartui =
              impl === "ChartArea" ? (
                <ChartArea key={idx} interpolation="monotoneX" {...props} />
              ) : (
                <ChartLine key={idx} interpolation="monotoneX" {...props} />
              )

            if (chart.yAxes[idx]) {
              return [...this.yAxis(chart.yAxes[idx]), chartui]
            } else {
              return [chartui]
            }
          })}
        </Chart>
      </Tile>
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
    return <React.Fragment>{this.props.charts.map(this.chart.bind(this))}</React.Fragment>
  }
}

function hasY(datum: object): datum is { y: number } {
  const yish = datum as { y: number }
  return yish && typeof yish.y === "number"
}
