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
import { EventEmitter } from "events"
import { Profiles } from "madwizard"
import { Loading } from "@kui-shell/plugin-client-common"
import { Grid, GridItem, Tile } from "@patternfly/react-core"

import ProfileWatcher from "../tray/watchers/profile/list"

import PlusIcon from "@patternfly/react-icons/dist/esm/icons/user-plus-icon"
// import ProfileIcon from "@patternfly/react-icons/dist/esm/icons/user-icon"

const events = new EventEmitter()

function emitSelectProfile(profile: string) {
  events.emit("/profile/select", profile)
}

export function onSelectProfile(cb: (profile: string) => void) {
  events.on("/profile/select", cb)
}

export function offSelectProfile(cb: (profile: string) => void) {
  events.off("/profile/select", cb)
}

type Props = Record<string, never>

type State = {
  watcher: ProfileWatcher
  selectedProfile?: string
  profiles?: Profiles.Profile[]
  catastrophicError?: unknown
}

export default class ProfileExplorer extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.init()
  }

  private readonly updateFn = () => {
    // slice to force a render; TODO we could do a comparison to avoid
    // false re-renders if we want to get fancy
    this.setState((curState) => {
      const profiles = curState.watcher.profiles.slice()
      if (!curState || !curState.profiles || curState.profiles.length === 0) {
        // sort the first time we get a list of profiles; TODO should
        // we re-sort if the list changes? what we want to avoid is
        // resorting simply because the selection changed
        profiles.sort((a, b) => b.lastUsedTime - a.lastUsedTime)
      }
      return {
        profiles,
      }
    })
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

  /** User has clicked to select a profile */
  private readonly onSelect = async (evt: React.MouseEvent<HTMLElement>) => {
    const selectedProfile = evt.currentTarget.getAttribute("data-profile")
    evt.currentTarget.scrollIntoView(true)
    if (selectedProfile) {
      if (await Profiles.bumpLastUsedTime(selectedProfile)) {
        emitSelectProfile(selectedProfile)
        this.setState({ selectedProfile })
      }
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
          {this.state.profiles.map((_, idx) => (
            <GridItem key={_.name}>
              <Tile
                className="codeflare--tile"
                data-profile={_.name}
                title={_.name}
                isSelected={!this.state.selectedProfile ? idx === 0 : this.state.selectedProfile === _.name}
                onClick={this.onSelect}
              >
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
