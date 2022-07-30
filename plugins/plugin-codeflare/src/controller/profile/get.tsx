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
import prettyMillis from "pretty-ms"
import { Profiles } from "madwizard"
import { Gallery, GalleryItem, Tile } from "@patternfly/react-core"

import PlusIcon from "@patternfly/react-icons/dist/esm/icons/user-plus-icon"
import ProfileIcon from "@patternfly/react-icons/dist/esm/icons/user-icon"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function getProfiles() {
  const profiles = await Profiles.list({})

  return {
    react: (
      <Gallery className="flex-fill sans-serif top-pad left-pad right-pad bottom-pad" hasGutter>
        <GalleryItem>
          <Tile className="codeflare--tile codeflare--tile-new" title="New Profile" icon={<PlusIcon />} isStacked>
            Customize a profile
          </Tile>
        </GalleryItem>

        {profiles.map((_) => (
          <GalleryItem key={_.profile.name}>
            <Tile className="codeflare--tile" title={_.profile.name} icon={<ProfileIcon />} isStacked>
              {`Last used ${prettyMillis(Date.now() - _.profile.lastUsedTime, { compact: true })} ago`}
            </Tile>
          </GalleryItem>
        ))}
      </Gallery>
    ),
  }
}
