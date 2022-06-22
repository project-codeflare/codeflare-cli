import React from "react"
import { Chart, ChartAxis, ChartGroup, ChartLine } from "@patternfly/react-charts"
import { Log } from "../types"

type Props = {
  logs: Log[]
}

const GPUChart = (props: Props) => {
  const { logs } = props

  return (
    <div style={{ height: "250px", width: "600px" }}>
      <Chart
        ariaTitle="GPU Utilization"
        ariaDesc="Chart showing GPU utilization over time"
        height={250}
        width={600}
        maxDomain={{ y: 100 }}
        minDomain={{ y: 0 }}
      >
        <ChartAxis dependentAxis showGrid tickValues={[0, 25, 50, 75, 100]} />
        <ChartGroup>
          <ChartLine
            data={logs.map((log) => ({
              name: log.gpuType,
              x: new Date(log.timestamp),
              y: log.utilizationGPU,
            }))}
          />
        </ChartGroup>
      </Chart>
    </div>
  )
}

export default GPUChart
