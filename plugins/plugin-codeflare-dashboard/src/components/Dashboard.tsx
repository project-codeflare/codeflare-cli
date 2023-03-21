/*
 * Copyright 2023 The Kubernetes Authors
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
import { Box, Text, TextProps } from "ink"
import type { Arguments } from "@kui-shell/core"

type WorkerState = "Pending" | "Scheduled" | "Installing" | "Running" | "Failed" | "Success"

type Props = unknown
type State = {
  workers: WorkerState[]
}

class Dashboard extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)

    const styles = Object.keys(this.styleOf) as WorkerState[]
    const randoState = () => styles[Math.round(Math.random() * styles.length) % styles.length]
    this.state = {
      workers: Array(50).fill(1).map(randoState),
    }

    setInterval(() => {
      this.setState((curState) => {
        const idx = Math.round(Math.random() * this.state.workers.length) % this.state.workers.length
        const styles = Object.keys(this.styleOf)
        const newState = styles[Math.round(Math.random() * styles.length) % styles.length]
        return {
          workers: [...curState.workers.slice(0, idx), newState as WorkerState, ...curState.workers.slice(idx + 1)],
        }
      })
    }, 1000)
  }

  // private readonly sizes = ["▁▁", "▃▃", "▅▅", "▆▆", "██", "■■"]
  // private readonly sizes = "■".repeat(5)
  private readonly sizes = Array(5).fill("▇▇")
  // private readonly sizes = "█".repeat(4)

  private readonly styleOf: Record<WorkerState, TextProps> = {
    Pending: { color: "gray", children: this.sizes[3] },
    Scheduled: { color: "white", dimColor: true, children: this.sizes[3] },
    // Pulling: { color: "yellow", dimColor: true, children: this.sizes[3] },
    Installing: { color: "yellow", children: this.sizes[3] },
    Running: { color: "cyan", children: this.sizes[4] },
    Failed: { color: "red", children: this.sizes[4] },
    Success: { color: "blue", children: this.sizes[4] },
  }

  private matrix(): WorkerState[][] {
    const N = Math.ceil(Math.sqrt(this.state.workers.length))
    const matrix = Array(N)
    for (let i = 0; i < N; i++) {
      matrix[i] = Array(N)
      for (let j = 0; j < N; j++) {
        matrix[i][j] = this.state.workers[i * N + j]
      }
    }
    return matrix
  }

  private histo(): number[] {
    const keys = Object.keys(this.styleOf)
    const indexer = keys.reduce((M, worker, idx) => {
      M[worker] = idx
      return M
    }, {} as Record<string, number>)

    return this.state.workers.reduce((H, worker) => {
      H[indexer[worker]]++
      return H
    }, Array(keys.length).fill(0))
  }

  public render() {
    const M = this.matrix()
    const H = this.histo()

    return (
      <Box flexDirection="column" margin={1}>
        <Box>
          {Object.keys(this.styleOf).map((_, idx) => (
            <Box width="20%" borderStyle="singleDouble" marginRight={1} key={_}>
              <Box flexDirection="column">
                <Box>
                  <Text color={this.styleOf[_ as WorkerState].color} bold inverse>
                    {_}
                  </Text>
                </Box>
                <Box>
                  <Text>{H[idx]}</Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box marginTop={1} width={M.reduce((N, c) => (N += c.length), 0)} flexDirection="column">
          {M.map((row, ridx) => (
            <Box key={ridx}>
              {row.map((worker, cidx) => (
                <Text key={cidx} {...this.styleOf[worker]} />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function dashboard(args: Arguments) {
  const { render } = await import("ink")
  await render(<Dashboard />)
  await new Promise(() => {}) // eslint-disable-line @typescript-eslint/no-empty-function
  return true
}
