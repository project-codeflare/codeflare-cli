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
import { Profiles } from "madwizard"
import { Arguments } from "@kui-shell/core"
import { Grid, GridItem, Tile } from "@patternfly/react-core"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function getProfiles(args: Arguments) {
  const profiles = await Profiles.list({})

  return {
    react: (
      <Grid hasGutter className="codeflare--grid">
        {profiles.map((_) => (
          <GridItem key={_.profile.name}>
            <Tile isSelected className="codeflare--tile" title={_.profile.name} />
          </GridItem>
        ))}
      </Grid>
    ),
  }
}
