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
import { Tooltip } from "@kui-shell/plugin-client-common"

import { GenericEvent } from "../controller/events/Event"

import "@kui-shell/plugin-client-common/web/scss/components/Table/_index.scss"
import "@kui-shell/plugin-client-common/web/scss/components/Table/Grid/_index.scss"
import "../../web/scss/components/Dashboard/Grid.scss"

interface Props {
  events: GenericEvent[]
}

export default class Grid extends React.PureComponent<Props> {
  private tooltipContent(event: GenericEvent) {
    const title = event.name
    const subtitle = event.subtitle || event.type
    const status = event.state
    const showMoreDetail = event.message || " "

    return `### ${title}
#### ${subtitle}

${status ? "Status: " + status : ""}

\`${showMoreDetail}\``
  }

  private readonly cell = (event: GenericEvent, idx: number) => {
    return (
      <Tooltip key={idx} markdown={this.tooltipContent(event)}>
        <span
          className="kui--grid-cell"
          data-tag="badge"
          data-type={event.type.replace(/\s/g, "")}
          data-state={event.state}
        >
          <span data-tag="badge-circle"></span>
        </span>
      </Tooltip>
    )
  }

  public render() {
    return (
      <div className="kui--data-table-wrapper kui--data-table-as-grid">
        <div className="kui--table-like-wrapper kui--data-table-as-grid">{this.props.events.map(this.cell)}</div>
      </div>
    )
  }
}
