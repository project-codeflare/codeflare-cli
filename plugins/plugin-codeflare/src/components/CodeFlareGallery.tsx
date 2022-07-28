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
import { Flex, FlexItem } from "@patternfly/react-core"

import AsciinemaPlayer from "./AsciinemaPlayer"

import "../../web/scss/components/Cast/_index.scss"

import glueCast from "@kui-shell/client/casts/glue.cast"

export default class CodeFlareGallery extends React.PureComponent {
  private readonly casts = [glueCast]

  public render() {
    return (
      <Flex className="flex-fill flex-layout flex-align-stretch codeflare--gallery kui--inverted-color-context">
        {this.casts.map((cast, idx) => (
          <FlexItem key={idx} className="flex-fill flex-layout">
            <AsciinemaPlayer
              src={cast}
              cols={120}
              rows={38}
              loop
              terminalFontFamily="var(--font-monospace)"
              autoPlay={true}
            />
          </FlexItem>
        ))}
      </Flex>
    )
  }
}
