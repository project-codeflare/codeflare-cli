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
import { Loading } from "@kui-shell/plugin-client-common"

import Terminal, { Props } from "./RestartableTerminal"
import { onSelectProfile, offSelectProfile } from "./ProfileExplorer"

type State = {
  cmdline?: string
}

export default class SelectedProfileTerminal extends React.PureComponent<Props, State> {
  public static readonly selectedProfilePattern = /\$\{SELECTED_PROFILE\}/g

  public constructor(props: Props) {
    super(props)
    onSelectProfile(this.onSelect)
    // this.init()
  }

  public componentWillUnmount() {
    offSelectProfile(this.onSelect)
  }

  private readonly onSelect = async (selectedProfile: string) => {
    const cmdline = await this.cmdline(selectedProfile)
    this.setState({ cmdline })
  }

  /* private async init() {
    const cmdline = await this.cmdline()
    this.setState({ cmdline })
  } */

  private async cmdline(selectedProfile: string) {
    return this.props.cmdline.replace(SelectedProfileTerminal.selectedProfilePattern, selectedProfile)
  }

  public render() {
    if (!this.state || !this.state.cmdline) {
      return <Loading />
    } else {
      return <Terminal key={this.state.cmdline} {...this.props} cmdline={this.state.cmdline} />
    }
  }
}
