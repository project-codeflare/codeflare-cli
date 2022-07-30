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
import { Loading } from "@kui-shell/plugin-client-common"
import { Grid, GridItem, Tile } from "@patternfly/react-core"

import ProfileWatcher from "../../tray/watchers/profile/list"

import PlusIcon from "@patternfly/react-icons/dist/esm/icons/user-plus-icon"
import ProfileIcon from "@patternfly/react-icons/dist/esm/icons/user-icon"

type Props = Record<string, never>

type State = {
  watcher: ProfileWatcher
  profiles: Profiles.Profile[]
  catastrophicError?: unknown
}

class ProfileExplorer extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.init()
  }

  private readonly updateFn = () => {
    // slice to force a render; TODO we could do a comparison to avoid
    // false re-renders if we want to get fancy
    this.setState((curState) => ({
      profiles: curState.watcher.profiles.slice(),
    }))
  }

  private async init() {
    try {
      const watcher = await new ProfileWatcher(this.updateFn, await Profiles.profilesPath({}, true)).init()
      this.setState({
        watcher,
        profiles: [],
      })
    } catch (err) {
      console.error(err)
      this.setState({ catastrophicError: err })
    }
  }

  public componentWillUnmount() {
    if (this.state && this.state.watcher) {
      this.state.watcher.close()
    }
  }

  public render() {
    if (this.state && this.state.catastrophicError) {
      return "Internal Error"
    } else if (!this.state || !this.state.profiles) {
      return <Loading />
    } else {
      return (
        <Grid className="codeflare--gallery-grid flex-fill sans-serif top-pad left-pad right-pad bottom-pad" hasGutter>
          {this.state.profiles.map((_) => (
            <GridItem key={_.name}>
              <Tile className="codeflare--tile" title={_.name} icon={<ProfileIcon />} isStacked>
                {`Last used ${prettyMillis(Date.now() - _.lastUsedTime, { compact: true })} ago`}
              </Tile>
            </GridItem>
          ))}

          {
            <GridItem>
              <Tile className="codeflare--tile codeflare--tile-new" title="New Profile" icon={<PlusIcon />} isStacked>
                Customize a profile
              </Tile>
            </GridItem>
          }
        </Grid>
      )
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function getProfiles() {
  return {
    react: <ProfileExplorer />,
  }
}
