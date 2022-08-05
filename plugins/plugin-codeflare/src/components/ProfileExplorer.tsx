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
import { Loading } from "@kui-shell/plugin-client-common"
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Title,
  Button,
  Flex,
  FlexItem,
  CardFooter,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Divider,
} from "@patternfly/react-core"

import ProfileSelect from "./ProfileSelect"
import DashboardSelect from "./DashboardSelect"
import ProfileWatcher from "../tray/watchers/profile/list"
import { handleBoot, handleShutdown } from "../controller/profile/actions"

import "../../web/scss/components/Dashboard/Description.scss"
import "../../web/scss/components/ProfileExplorer/_index.scss"

type Props = {
  onSelectProfile?(profile: string): void
}

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

  private readonly _handleProfileSelection = (selectedProfile: string) => {
    this.setState({ selectedProfile })

    if (this.props.onSelectProfile) {
      this.props.onSelectProfile(selectedProfile)
    }
  }

  private updateDebouncer: null | ReturnType<typeof setTimeout> = null

  private readonly updateFn = () => {
    if (this.updateDebouncer) {
      clearTimeout(this.updateDebouncer)
    }

    // hmm, this is imperfect... the watcher seems to give us [A],
    // then [A,B], then [A,B,C] in quick succession. is there any way
    // to know that we are done with the initial batch? for now, we do
    // some debouncing.
    this.updateDebouncer = setTimeout(() => {
      this.setState((curState) => {
        if (JSON.stringify(curState.watcher.profiles) === JSON.stringify(curState.profiles)) {
          return null
        }

        const profiles = curState.watcher.profiles.slice()

        let selectedProfile = curState.selectedProfile
        if (!curState || !curState.profiles || curState.profiles.length === 0) {
          // use the last-used profile by default
          const newSelectedProfile = profiles.slice(1).reduce((lastUsed, profile) => {
            if (lastUsed.lastUsedTime < profile.lastUsedTime) {
              return profile
            } else {
              return lastUsed
            }
          }, profiles[0])

          // also emit an initial profile selection event
          if (newSelectedProfile) {
            selectedProfile = newSelectedProfile.name
            if (this.props.onSelectProfile) {
              this.props.onSelectProfile(newSelectedProfile.name)
            }
          }
        }

        return {
          profiles,
          selectedProfile,
        }
      })
    }, 100)
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
    } else if (!this.state || !this.state.profiles || !this.state.selectedProfile) {
      return <Loading />
    } else {
      return (
        <div className="codeflare--profile-explorer flex-fill top-pad left-pad right-pad bottom-pad">
          <ProfileCard
            profile={this.state.selectedProfile}
            profiles={this.state.profiles}
            onSelectProfile={this._handleProfileSelection}
          />
        </div>
      )
    }
  }
}

class ProfileCard extends React.PureComponent<{
  profile: string
  profiles: Profiles.Profile[]
  onSelectProfile: (profile: string) => void
}> {
  private readonly _handleBoot = () => handleBoot(this.props.profile)
  private readonly _handleShutdown = () => handleShutdown(this.props.profile)

  private title() {
    return (
      <Title headingLevel="h2" size="xl">
        <ProfileSelect
          selectedProfile={this.props.profile}
          profiles={this.props.profiles}
          onSelect={this.props.onSelectProfile}
        />
      </Title>
    )
  }

  private actions() {
    return "Status: pending"
  }

  private body() {
    // TODO: Retrieve real data and abstract to its own component
    return (
      <DescriptionList className="codeflare--profile-explorer--description">
        <DescriptionListGroup className="codeflare--profile-explorer--description--group">
          <DescriptionListTerm>Cluster Context</DescriptionListTerm>
          <DescriptionListDescription>api-codeflare-train-v11-codeflare-openshift-com</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup className="codeflare--profile-explorer--description--group">
          <DescriptionListTerm>Cluster Namespace</DescriptionListTerm>
          <DescriptionListDescription>nvidia-gpu-operator</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup className="codeflare--profile-explorer--description--group">
          <DescriptionListTerm>Memory per Worker</DescriptionListTerm>
          <DescriptionListDescription>32Gi</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup className="codeflare--profile-explorer--description--group">
          <DescriptionListTerm>Worker Count</DescriptionListTerm>
          <DescriptionListDescription>4-4</DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    )
  }

  private footer() {
    return (
      <Flex>
        <FlexItem>
          <Button variant="link" isSmall className="codeflare--profile-explorer--boot-btn" onClick={this._handleBoot}>
            Boot
          </Button>
          <Button
            variant="link"
            isSmall
            className="codeflare--profile-explorer--shutdown-btn"
            onClick={this._handleShutdown}
          >
            Shutdown
          </Button>
        </FlexItem>
        <FlexItem flex={{ default: "flex_1" }}>
          <DashboardSelect selectedProfile={this.props.profile} />
        </FlexItem>
      </Flex>
    )
  }

  public render() {
    return (
      <Card className="top-pad left-pad right-pad bottompad" isSelectableRaised isSelected>
        <CardHeader>
          <CardTitle>{this.title()}</CardTitle>
          <CardActions hasNoOffset>{this.actions()}</CardActions>
        </CardHeader>
        <CardBody>{this.body()}</CardBody>
        <Divider />
        <CardFooter>{this.footer()}</CardFooter>
      </Card>
    )
  }
}
