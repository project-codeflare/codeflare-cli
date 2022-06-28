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

import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
} from "@patternfly/react-core"

import { Summary } from "../controller/description"

import "../../web/scss/components/Dashboard/Description.scss"

type Props = {
  summaryData: Summary
}

const Description = (props: Props) => {
  const { summaryData } = props

  return (
    <DescriptionList>
      {summaryData.map(({ label, value }, index) => (
        <DescriptionListGroup key={index}>
          <DescriptionListTerm>{label}</DescriptionListTerm>
          <DescriptionListDescription>{value}</DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  )
}

export default Description
