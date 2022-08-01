/*
 * Copyright 2020 The Kubernetes Authors
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
import { Icons, TextWithIconWidget } from "@kui-shell/plugin-client-common"

import { homepage, version } from "@kui-shell/client/package.json"
import { productName } from "@kui-shell/client/config.d/name.json"

export default class CodeFlareWidget extends React.PureComponent {
  private readonly popover = {
    bodyContent: CodeFlareWidget.popoverBody(),
    headerContent: CodeFlareWidget.popoverHeader(),
  }

  private static popoverBody() {
    return (
      <div className="not-very-wide pre-wrap">
        <a href="https://codeflare.dev">CodeFlare</a> simplifies the integration, scaling and acceleration of complex
        multi-step analytics and machine learning pipelines on the cloud.
      </div>
    )
  }

  private static popoverHeader() {
    return (
      <React.Fragment>
        <div>{productName}</div>
        <div>
          <strong>Making ML Awesome</strong>
        </div>
        <div className="sub-text even-smaller-text">
          <a href={homepage}>
            <Icons icon="Github" className="somewhat-larger-text small-right-pad" />
            Visit us on Github
          </a>
        </div>
      </React.Fragment>
    )
  }

  public render() {
    return (
      <TextWithIconWidget
        text={`${productName} v${version}`}
        viewLevel="normal"
        popover={this.popover}
        position="top-start"
      />
    )
  }
}
