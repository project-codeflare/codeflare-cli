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
import { Select, TextWithIconWidget } from "@kui-shell/plugin-client-common"

type Props = {
  currentRun: string
}

export default class CodeFlareSelectorWidget extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props)
  }

  runSelected = this.props.currentRun || "No run selected"

  popover = {
    headerContent: this.popoverHeader(),
    bodyContent: this.popoverBody(),
  }

  popoverHeader() {
    return (
      <React.Fragment>
        <div>Ray Jobs</div>
      </React.Fragment>
    )
  }

  popoverBody() {
    return <Select variant="typeahead" key={this.runSelected} selected={this.runSelected} options={[]} />
  }

  public render() {
    return <TextWithIconWidget text={this.runSelected} popover={this.popover} viewLevel="normal" position="top-start" />
  }
}
