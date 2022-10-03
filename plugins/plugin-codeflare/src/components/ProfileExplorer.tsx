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
import { diff } from "json-diff"
import { Icons, Loading, Tooltip } from "@kui-shell/plugin-client-common"
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  KebabToggle,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  Title,
  Button,
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
import { handleNew, handleDelete, handleReset } from "../controller/profile/actions"

import "../../web/scss/components/ProfileExplorer/_index.scss"

type Profile = import("madwizard").Profiles.Profile[]

type Props = {
  onSelectProfile?(profile: string, profiles?: Profile): void
  onSelectGuidebook?(guidebook: string): void
}

type Diff = {
  /** Difference from last model */
  profilesDiff: ReturnType<typeof diff>
}

type State = Partial<Diff> & {
  watcher: ProfileWatcher
  statusWatcher: ProfileStatusWatcher
  selectedProfile?: string
  profiles?: Profile
  catastrophicError?: unknown

  /** To help with re-rendering */
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

  /** If given `null`, then we will attempt to use the lastUsed profile */
  private readonly _handleProfileSelection = (selectedProfile: string | null) => {
    if (!selectedProfile && this.state.profiles) {
      // last used, excluding the currently selected profile
      const lastUsed = this.lastUsed(this.state.profiles.filter((_) => _.name !== this.state.selectedProfile))
      if (lastUsed) {
        selectedProfile = lastUsed.name
      }
    }

    if (selectedProfile) {
      this.setState({ selectedProfile })

      if (this.props.onSelectProfile) {
        this.props.onSelectProfile(selectedProfile, this.state.profiles)
      }
    }
  }

  private updateDebouncer: null | ReturnType<typeof setTimeout> = null

  private lastUsed(profiles: Profile) {
    return profiles.slice(1).reduce((lastUsed, profile) => {
      if (lastUsed.lastUsedTime < profile.lastUsedTime) {
        return profile
      } else {
        return lastUsed
      }
    }, profiles[0])
  }

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
          const newSelectedProfile = this.lastUsed(profiles)

          // also emit an initial profile selection event
          if (newSelectedProfile) {
            selectedProfile = newSelectedProfile.name
            if (this.props.onSelectProfile) {
              this.props.onSelectProfile(newSelectedProfile.name)
            }
          }
        }

        const before =
          selectedProfile && curState.profiles ? curState.profiles.find((_) => _.name === selectedProfile) : undefined
        const after = selectedProfile && curState.watcher.profiles.find((_) => _.name === selectedProfile)
        const profilesDiff = before && after ? diff(before.choices, after.choices) : undefined

        if (profilesDiff) {
          setTimeout(
            () =>
              this.setState((curState) => {
                if (curState.profilesDiff === profilesDiff) {
                  return {
                    profilesDiff: undefined,
                  }
                }
                return null
              }),
            5000
          )
        }

        const profForEvent = selectedProfile || curState.selectedProfile
        if (profForEvent && this.props.onSelectProfile) {
          this.props.onSelectProfile(profForEvent, profiles)
        }

        return {
          profiles,
          profilesDiff,
          selectedProfile,
        }
      })
    }, 100)
  }

  private async init() {
    try {
      const { Profiles } = await import("madwizard")
      Profiles.createIfNeeded()
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
        <div className="codeflare--profile-explorer flex-fill">
          <ProfileCard
            profile={this.state.selectedProfile}
            profiles={this.state.profiles}
            profilesDiff={this.state.profilesDiff}
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

type ProfileCardProps = Partial<Diff> &
  Pick<Props, "onSelectGuidebook"> & {
    profile: string
    profiles: Profile
    onSelectProfile: (profile: string | null) => void

    profileReadiness: string
    profileStatus: ProfileStatusWatcher
  }

type ProfileCardState = {
  isOpen: boolean

  /** Is the kebab action dropdown open? */
  isKebabOpen?: boolean
}

class ProfileCard extends React.PureComponent<ProfileCardProps, ProfileCardState> {
  public constructor(props: ProfileCardProps) {
    super(props)
    this.state = {
      isOpen: false,
    }
  }

  /** Create new profile */
  private readonly _handleNew = async () => {
    if (this.props.profile) {
      const newProfile = await handleNew(this.props.profile, this.props.profiles)
      this.props.onSelectProfile(newProfile)
    }
  }

  /** Delete selected profile */
  private readonly _handleDelete = async () => {
    if (this.props.profile) {
      await handleDelete(this.props.profile)
      this.props.onSelectProfile(null)
    }
  }

  private readonly _handleReset = () => this.props.profile && handleReset(this.props.profile)
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

  /** Toggle kebab menu open/closed */
  private readonly _onKebabToggle = () => this.setState((curState) => ({ isKebabOpen: !curState.isKebabOpen }))

  private actions() {
    return (
      <React.Fragment>
        {this.title()}
        <Dropdown
          isOpen={this.state.isKebabOpen}
          isPlain
          position="right"
          toggle={<KebabToggle onToggle={this._onKebabToggle} />}
          dropdownItems={this.actionItems}
        ></Dropdown>
      </React.Fragment>
    )
  }

  private actionsStatus() {
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
    Storage: {
      title: "Storage",
      name: "The storage aspects of this computer",
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
    ".*constraints/provider": {
      title: "Cloud Provider",
      group: this.groups.Compute,
    },
    ".*constraints/geo": {
      title: "Geographic Constraint",
      group: this.groups.Storage,
    },
    ".*constraints/compute/workers": {
      title: "Resources",
      group: this.groups.Compute,
    },
    ".*constraints/compute/accelerators/gpu": {
      title: "GPU Class",
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
    "aws/choose/profile": {
      title: "Credentials Profile",
      group: this.groups.Storage,
    },
    ".*constraints/workload/type": {
      title: "Workload Type",
      group: this.groups.Application,
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

  private readonly leafStyle = { color: "var(--color-base04)" }
  private leafFor(value: string) {
    return <span style={this.leafStyle}>{value}</span>
  }

  private descriptionFor(desc: string) {
    return <span className="italic">{desc}</span>
  }

  private treeNode(id: string, meta: Metadata, value: string) {
    // the `json-diff` npm has this behavior: for changed keys, the
    // diff object will use that key (hence the `profilesDiff[id]`
    // check); for added keys, the diff object will use a key
    // `${id}__added`, and hence the second check
    const justChanged =
      this.props.profilesDiff && (this.props.profilesDiff[id] || this.props.profilesDiff[id + "__added"])

    const title = justChanged ? <JustChanged>{meta.title}</JustChanged> : meta.title

    try {
      const form = JSON.parse(value) as Record<string, string>
      return {
        id,
        title,
        //name: this.form(form),
        name: Array.isArray(form) ? form.join(" ║ ") : "",
        children: Array.isArray(form)
          ? undefined
          : Object.entries(form).map(([title, name]) => ({ title, name: this.leafFor(name) })),
      }
    } catch (err) {
      return {
        id,
        title,
        name: this.leafFor(value),
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
          const metaKey = this.meta[title] ? title : Object.keys(this.meta).find((_) => new RegExp(_).test(title))
          if (metaKey) {
            const meta = this.meta[metaKey]
            if (meta) {
              if (!groups[meta.group.title]) {
                groups[meta.group.title] = {
                  title: meta.group.title,
                  name: meta.group.name && this.descriptionFor(meta.group.name),
                  children: [],
                }
              }
              const { children } = groups[meta.group.title]

              children.push(this.editable(title, this.treeNode(title, meta, value)))
            }
          }

          return groups
        }, {} as Record<string, TreeViewDataItemWithChildren>)

      const data = Object.values(tree)
      if (data.length === 0) {
        // oops, this profile has no "shape", no choices have been
        // made for us to visualize
        data.push({ title: "Empty", name: "So far, this profile has no constraints", children: [] })
      }
      this.sort(data)

      return <TreeView hasGuides defaultAllExpanded data={data} variant="compactNoBackground" />
    }

    return <Loading />
  }

  private sort(data: TreeViewDataItem[]) {
    data.sort((a, b) => (a.id || a.title || "").toString().localeCompare((b.id || b.title || "").toString()))

    data.forEach((_) => {
      if (Array.isArray(_.children)) {
        _.children = this.sort(_.children)
      }
    })

    return data
  }

  private readonly actionItems = [
    <DropdownItem
      key="new"
      component="button"
      description="Create a new profile"
      icon={<Icons icon="PlusSquare" />}
      className="codeflare--profile-explorer--new-btn"
      onClick={this._handleNew}
    >
      New
    </DropdownItem>,

    <DropdownSeparator key="separator" />,

    <DropdownItem
      key="clear"
      component="button"
      description="Reset the choices in this profile"
      icon={<Icons icon="Clear" />}
      className="codeflare--profile-explorer--reset-btn"
      onClick={this._handleReset}
    >
      Clear
    </DropdownItem>,

    <DropdownItem
      key="delete"
      component="button"
      description="Delete this profile"
      icon={<Icons icon="Trash" />}
      className="codeflare--profile-explorer--delete-btn"
      onClick={this._handleDelete}
    >
      Delete
    </DropdownItem>,
  ]

  public render() {
    return (
      <Card isLarge>
        <CardHeader>
          <CardTitle>Draft Specification</CardTitle>
          <CardActions hasNoOffset>{this.actions()}</CardActions>
        </CardHeader>
        <CardBody>{this.body()}</CardBody>
      </Card>
    )
  }
}

/**
 * A visual indicator that a tree node just changed. 1) Icon; 2)
 * scroll it into view.
 */
class JustChanged extends React.PureComponent {
  private readonly ref = React.createRef<HTMLSpanElement>()

  public componentDidMount() {
    if (this.ref.current && (this.ref.current as any)["scrollIntoViewIfNeeded"]) {
      (this.ref.current as any)["scrollIntoViewIfNeeded"]()
    } else {
      this.ref.current?.scrollIntoView()
    }
  }

  public render() {
    return (
      <span ref={this.ref}>
        <span className="underline">{this.props.children}</span>
        <Icons icon="Checkmark" className="small-left-pad green-text" />
      </span>
    )
  }
}
