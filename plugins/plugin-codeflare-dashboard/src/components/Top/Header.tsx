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
import { Box, Spacer, Text } from "ink"

import type { Context } from "./types.js"

type Props = Context

export default class Header extends React.PureComponent<Props> {
  public render() {
    return (
      <Box flexDirection="column">
        <Box>
          <Box>
            <Text>
              <Text color="magenta" bold>
                {"Cluster   " /* Cheapo alignment with "Namespace" */}
              </Text>
              {this.props.cluster.replace(/:\d+$/, "")}
            </Text>
          </Box>

          <Spacer />

          <Box marginLeft={1} justifyContent="flex-end">
            <Text dimColor color="magenta">
              <Text bold>PageUp/PageDown</Text>
            </Text>
          </Box>
        </Box>

        <Box>
          <Box>
            <Text>
              <Text color="blue" bold>
                Namespace{" "}
              </Text>
              {this.props.namespace || "default"}
            </Text>
          </Box>

          <Spacer />

          <Box marginLeft={1} justifyContent="flex-end">
            <Text dimColor color="blue">
              <Text bold>Up/Down</Text>
            </Text>
          </Box>
        </Box>
      </Box>
    )
  }
}
