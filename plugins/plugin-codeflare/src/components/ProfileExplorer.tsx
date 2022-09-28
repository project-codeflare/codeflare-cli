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
import { Icons, Loading, Tooltip } from "@kui-shell/plugin-client-common"
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
  Divider,
  Select,
  SelectVariant,
  SelectOption,
  TreeView,
  TreeViewDataItem,
  Chip,
  ChipGroup,
} from "@patternfly/react-core"

import ProfileSelect from "./ProfileSelect"
// import DashboardSelect from "./DashboardSelect"
import ProfileWatcher from "../tray/watchers/profile/list"
import ProfileStatusWatcher from "../tray/watchers/profile/status"
import UpdateFunction from "../tray/update"
import { handleReset } from "../controller/profile/actions"

import "../../web/scss/components/Dashboard/Description.scss"
import "../../web/scss/components/ProfileExplorer/_index.scss"

type Props = {
  onSelectProfile?(profile: string): void
  onSelectGuidebook?(guidebook: string): void
}

type State = {
  watcher: ProfileWatcher
  statusWatcher: ProfileStatusWatcher
  selectedProfile?: string
  profiles?: Profiles.Profile[]
  catastrophicError?: unknown

  updateCount: number
}

/** Tree node grouping */
type Group = { title: string; name?: string }

/** Metadata for tree node */
type Metadata = { title: string; group: Group }

/** */
type TreeViewDataItemWithChildren = TreeViewDataItem & Required<Pick<TreeViewDataItem, "children">>

export default class ProfileExplorer extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.init()
  }

  private readonly statusWatcherUpdateFn: UpdateFunction = () => {
    this.setState((curState) => ({
      updateCount: (curState?.updateCount || 0) + 1,
    }))
  }

  private readonly _handleProfileSelection = (selectedProfile: string) => {
    this.setState({ selectedProfile })

    if (this.props.onSelectProfile) {
      this.props.onSelectProfile(selectedProfile)
    }
  }

  private updateDebouncer: null | ReturnType<typeof setTimeout> = null

  private readonly profileWatcherUpdateFn = () => {
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
          // no change to profiles model
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
      const watcher = await new ProfileWatcher(
        this.profileWatcherUpdateFn,
        await Profiles.profilesPath({}, true)
      ).init()
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
    this.state?.watcher?.close()
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState?.selectedProfile !== this.state?.selectedProfile) {
      if (!this.state?.selectedProfile) return
      const statusWatcher = new ProfileStatusWatcher(this.state.selectedProfile, this.statusWatcherUpdateFn)
      this.setState({ statusWatcher })
    }
  }

  public render() {
    if (this.state?.catastrophicError) {
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
            onSelectGuidebook={this.props.onSelectGuidebook}
            profileReadiness={this.state.statusWatcher?.readiness}
            profileStatus={this.state.statusWatcher}
          />
        </div>
      )
    }
  }
}

type ProfileCardProps = Pick<Props, "onSelectGuidebook"> & {
  profile: string
  profiles: Profiles.Profile[]
  onSelectProfile: (profile: string) => void

  profileReadiness: string
  profileStatus: ProfileStatusWatcher
}

type ProfileCardState = {
  isOpen: boolean
}

class ProfileCard extends React.PureComponent<ProfileCardProps, ProfileCardState> {
  public constructor(props: ProfileCardProps) {
    super(props)
    this.state = {
      isOpen: false,
    }
  }
  private readonly _handleReset = () => handleReset(this.props.profile)
  // private readonly _handleBoot = () => handleBoot(this.props.profile)
  // private readonly _handleShutdown = () => handleShutdown(this.props.profile)
  private readonly _onToggle = () => this.setState({ isOpen: !this.state.isOpen })

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
    const StatusTitle = ({ readiness }: { readiness: string | undefined }) => (
      <React.Fragment>
        <span>Status</span>
        <div
          className={`codeflare--profile-explorer--status-light codeflare--profile-explorer--status-light--${readiness}`}
        ></div>
      </React.Fragment>
    )
    return (
      <Select
        className="codeflare--profile-explorer--select-status"
        variant={SelectVariant.single}
        placeholderText={<StatusTitle readiness={this.props.profileStatus?.readiness} />}
        label="Status select"
        onToggle={this._onToggle}
        isOpen={this.state.isOpen}
        aria-labelledby="select-status-label"
      >
        <SelectOption isPlaceholder>{this.props.profileStatus?.head.label}</SelectOption>
        <SelectOption isPlaceholder>{this.props.profileStatus?.workers.label}</SelectOption>
      </Select>
    )
  }

  private readonly groups: Record<string, Group> = {
    Application: {
      title: "Application",
      name: "Properties of what will be run against this computer",
    },
    Compute: {
      title: "Compute",
      name: "The computational aspects of this computer",
    },
  }

  private readonly meta: Record<string, Metadata> = {
    "ml/codeflare/run": {
      title: "Scenario",
      group: this.groups.Application,
    },
    "ml/codeflare/training/demos": {
      title: "Demo Code",
      group: this.groups.Application,
    },
    "ml/ray/start/resources": {
      title: "Resources",
      group: this.groups.Compute,
    },
    "kubernetes/context": {
      title: "Cluster",
      group: this.groups.Compute,
    },
    "kubernetes/choose/ns": {
      title: "Namespace",
      group: this.groups.Compute,
    },
  }

  private form(form: Record<string, string>) {
    return (
      <ChipGroup numChips={10}>
        {Object.entries(form).map(([title, name]) => (
          <Chip key={title} isReadOnly textMaxWidth="25ch">
            <span className="slightly-deemphasize">{title}</span> <span className="semi-bold color-base0D">{name}</span>
          </Chip>
        ))}
      </ChipGroup>
    )
  }

  private treeNode(meta: Metadata, value: string) {
    try {
      const form = JSON.parse(value) as Record<string, string>
      return {
        title: meta.title,
        name: this.form(form),
        //children: Object.entries(form).map(([title, name]) => ({ title, name }))
      }
    } catch (err) {
      return {
        title: meta.title,
        name: value,
      }
    }
  }

  private readonly onEdit = (evt: React.MouseEvent) => {
    const guidebook = evt.currentTarget.getAttribute("data-guidebook")
    if (guidebook) {
      if (this.props.onSelectGuidebook) {
        this.props.onSelectGuidebook(guidebook)
      }
    } else {
      console.error("Missing guidebook attribute")
    }
  }

  private editable<T extends TreeViewDataItem>(guidebook: string, node: T) {
    return Object.assign(node, {
      action: (
        <Tooltip markdown={`### Update\n#### ${guidebook}\n\nClick to update this choice`}>
          <Button
            variant="plain"
            aria-label="Edit"
            data-guidebook={guidebook}
            onClick={this.onEdit}
            className="codeflare--profile-explorer-edit-button"
          >
            <Icons icon="Edit" />
          </Button>
        </Tooltip>
      ),
    })
  }

  private body() {
    // TODO: Retrieve real data and abstract to its own component
    const profile = this.props.profiles.find((_) => _.name === this.props.profile)
    if (profile) {
      const tree = Object.entries(profile.choices)
        .filter((_) => !/^madwizard\//.test(_[0])) // filter out madwizard internals
        .filter((_) => !/expand\(|####/.test(_[0])) // filter out old style of choices
        .filter((_) => !/test\/inputs/.test(_[0])) // filter out test residuals
        .reduce((groups, [title, value]) => {
          const meta = this.meta[title]
          if (meta) {
            if (!groups[meta.group.title]) {
              groups[meta.group.title] = {
                title: meta.group.title,
                name: meta.group.name,
                children: [],
              }
            }
            const { children } = groups[meta.group.title]

            children.push(this.editable(title, this.treeNode(meta, value)))
          }

          return groups
        }, {} as Record<string, TreeViewDataItemWithChildren>)

      const data = Object.values(tree)
      if (data.length === 0) {
        // oops, this profile has no "shape", no choices have been
        // made for us to visualize
        data.push({ name: "Empty", children: [] })
      }

      return <TreeView hasGuides defaultAllExpanded data={data} variant="compactNoBackground" />
    }

    return "Internal Error"
  }

  private footer() {
    return (
      <Flex>
        <FlexItem flex={{ default: "flex_1" }}></FlexItem>
        <FlexItem>
          <Button variant="link" isSmall className="codeflare--profile-explorer--reset-btn" onClick={this._handleReset}>
            Reset
          </Button>
        </FlexItem>
        {/*<FlexItem>
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
          </FlexItem>*/}
      </Flex>
    )
  }

  public render() {
    return (
      <Card className="top-pad left-pad right-pad bottom-pad" isSelectableRaised isSelected>
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
