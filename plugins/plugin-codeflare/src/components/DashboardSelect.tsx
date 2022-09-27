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
import { openWindow } from "../controller/profile/actions"
import { Select, SelectOption, SelectOptionObject } from "@patternfly/react-core"

type Props = {
  selectedProfile?: string
}

type State = {
  selectIsOpen: boolean
}

export default class DashboardSelect extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = {
      selectIsOpen: false,
    }
  }
  private readonly _dashboardSelectOnToggle = this.dashboardSelectOnToggle.bind(this)
  private readonly _dashboardSelectOnSelect = this.dashboardSelectOnSelect.bind(this)

  dashboardSelectOnToggle(selectIsOpen: boolean) {
    this.setState({ selectIsOpen })
  }

  async dashboardSelectOnSelect(
    event: React.ChangeEvent<Element> | React.MouseEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) {
    if (isPlaceholder) {
      this.setState({ selectIsOpen: false })
    } else {
      openWindow(`Codeflare Run Summary - ${this.props.selectedProfile}`, "Codeflare Run Summary", [
        "codeflare",
        "get",
        "run",
        "--profile",
        this.props.selectedProfile,
      ])
      this.setState({ selectIsOpen: false })
    }
  }

  public render() {
    return (
      <Select
        variant="single"
        direction="up"
        placeholderText="Dashboards"
        aria-label="Dashboards selector"
        onToggle={this._dashboardSelectOnToggle}
        onSelect={this._dashboardSelectOnSelect}
        isOpen={this.state.selectIsOpen}
        aria-labelledby="select-dashboard-label"
      >
        <SelectOption value="CodeFlare" />
        <SelectOption value="MLFlow" isPlaceholder />
        <SelectOption value="Tensorboard" isPlaceholder />
      </Select>
    )
  }
}
