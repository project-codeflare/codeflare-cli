import React from "react"

import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
} from "@patternfly/react-core"
import { Summary } from "../lib/util"

type Props = {
  summaryData: Summary
}

const Description = (props: Props) => {
  const { summaryData } = props

  return (
    <DescriptionList isHorizontal>
      {Object.values(summaryData).map(({ label, value }, index) => (
        <DescriptionListGroup key={index}>
          <DescriptionListTerm>{label}</DescriptionListTerm>
          <DescriptionListDescription>{value}</DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  )
}

export default Description
