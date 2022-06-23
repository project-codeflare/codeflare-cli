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
import { Chart, ChartAxis, ChartArea } from "@patternfly/react-charts"
import { Log } from "../types"

import "../../web/scss/components/Dashboard/Charts.scss"

type Props = {
  logs: Log[]
}

const generateXFormat = (logs: Log[]) => {
  return [
    ...new Set(
      logs
        .filter((item) => item.utilizationGPU > 0)
        .map((item) => `${new Date(item.timestamp).getHours()}:${new Date(item.timestamp).getMinutes()}`)
    ),
  ]
}

const generateXValues = (logs: Log[]) => {
  return [...new Set(logs.filter((item) => item.utilizationGPU > 0).map((item) => item.timestamp))]
}

const axisStyle = { tickLabels: { fontSize: 9 } }
const yTickValues = [0, 25, 50, 75, 100]
const yTickLabels = yTickValues.map((_) => `${_}%`)

const styles = {
  memory: { data: { fill: "var(--color-chart-0)" } },
  gpu: { data: { fill: "var(--color-chart-1)" } },
}

const GPUChart = (props: Props) => {
  const { logs } = props
  return (
    <div style={{ height: "auto", width: "100%", display: "flex", flexDirection: "column" }}>
      <Chart
        ariaTitle="GPU Utilization"
        ariaDesc="Chart showing GPU utilization over time"
        height={135}
        width={1000}
        maxDomain={{ y: 100 }}
        minDomain={{ y: 0 }}
        padding={{
          bottom: 25,
          left: 60,
          right: 5,
          top: 10,
        }}
      >
        <ChartAxis
          label="GPU"
          dependentAxis
          showGrid
          style={axisStyle}
          tickValues={yTickValues}
          tickFormat={yTickLabels}
        />
        <ChartAxis
          scale="time"
          style={axisStyle}
          tickValues={generateXValues(logs)}
          tickFormat={generateXFormat(logs)}
          tickCount={generateXFormat(logs).length}
        />
        <ChartArea
          style={styles.gpu}
          data={logs.map((log) => ({
            name: log.gpuType,
            x: log.timestamp,
            y: log.utilizationGPU,
          }))}
        />
      </Chart>
      <Chart
        ariaTitle="GPU Memory Utilization"
        ariaDesc="Chart showing GPU memory utilization over time"
        height={135}
        width={1000}
        maxDomain={{ y: 100 }}
        minDomain={{ y: 0 }}
        padding={{
          bottom: 25,
          left: 60,
          right: 5,
          top: 10,
        }}
      >
        <ChartAxis
          label="Memory"
          dependentAxis
          showGrid
          style={axisStyle}
          tickValues={yTickValues}
          tickFormat={yTickLabels}
        />
        <ChartAxis
          scale="time"
          style={axisStyle}
          tickValues={generateXValues(logs)}
          tickFormat={generateXFormat(logs)}
          tickCount={generateXFormat(logs).length}
        />
        <ChartArea
          style={styles.memory}
          data={logs.map((log) => ({
            name: log.gpuType,
            x: log.timestamp,
            y: log.utilizationMemory,
          }))}
        />
      </Chart>
    </div>
  )
}

export default GPUChart
