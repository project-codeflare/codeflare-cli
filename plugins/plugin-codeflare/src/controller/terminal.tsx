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
import { Allotment, AllotmentHandle } from "allotment"
import { Loading } from "@kui-shell/plugin-client-common"
import { Arguments, encodeComponent } from "@kui-shell/core"
import { defaultGuidebook as defaultGuidebookFromClient } from "@kui-shell/client/config.d/client.json"
import { Button, EmptyState, EmptyStateBody, EmptyStatePrimary, Flex, FlexItem, Title } from "@patternfly/react-core"

import respawn from "./respawn"

import AskingTerminal from "../components/AskingTerminal"
import ProfileExplorer from "../components/ProfileExplorer"
import Terminal, { Props as BaseProps } from "../components/RestartableTerminal"

import "../../web/scss/components/Allotment/_index.scss"
import "allotment/dist/style.css"

class AllotmentFillPane extends React.PureComponent<{ minSize?: number }> {
  public render() {
    return (
      <Allotment.Pane className="flex-fill flex-layout flex-align-stretch" minSize={this.props.minSize}>
        {this.props.children}
      </Allotment.Pane>
    )
  }
}

/**
 * This is a command handler that opens up a plain terminal that shows a login session using the user's $SHELL.
 */
export async function shell(args: Arguments) {
  // respawn, meaning launch it with codeflare
  const { argv, env } = await respawn(["$SHELL", "-l"])
  const cmdline = argv.map((_) => encodeComponent(_)).join(" ")

  return {
    react: <Terminal cmdline={cmdline} env={env} REPL={args.REPL} tab={args.tab} />,
  }
}

export type Props = Pick<BaseProps, "tab" | "REPL" | "onExit" | "searchable" | "fontSizeAdjust"> & {
  /** Default guidebook (if not given, we will take the value from the client definition); `null` means do not show anything */
  defaultGuidebook?: string | null

  /** Run guidebook in non-interactive mode? */
  defaultNoninteractive?: boolean

  /** Any extra env vars to add to the guidebook execution. These will be pre-joined with the default env. */
  extraEnv?: BaseProps["env"]

  /** Callback when user selects a profile */
  onSelectProfile?(profile: string, profiles?: import("madwizard").Profiles.Profile[]): void

  /** Content to place above the terminal */
  aboveTerminal?: React.ReactNode
}

type State = Partial<Pick<BaseProps, "cmdline" | "env">> & {
  /** Number of times we have called this.init() */
  initCount: number

  /** Internal error in rendering */
  error?: boolean

  /** Use this guidebook in the terminal execution */
  guidebook?: string | null

  /** Any extra env vars to add to the guidebook execution. These will be pre-joined with the default env. */
  extraEnv?: BaseProps["env"]

  /** Run guidebook in non-interactive mode? */
  noninteractive?: boolean

  /** Interactive only for the given guidebook? */
  ifor?: boolean

  /** Use this profile in the terminal execution */
  selectedProfile?: string

  /** Hide terminal? */
  hideTerminal?: boolean
}

export class WorkloadDesigner extends React.PureComponent<Props, State> {
  /** Allotment initial split ... allotments */
  private readonly splits = {
    horizontal: [25, 75],
    vertical1: [50, 50], // no `this.props.aboveTerminal`
    vertical2a: [60, 40], // yes, and show a guidebook
    vertical2b: [80, 20], // yes, and do not show a guidebook
  }

  private readonly tasks = [{ label: "Run a Job", argv: ["codeflare", "-p", "${SELECTED_PROFILE}"] }]

  public constructor(props: Props) {
    super(props)

    this.state = {
      initCount: 0,
      guidebook: props.defaultGuidebook === null ? null : props.defaultGuidebook || defaultGuidebookFromClient,
    }
    this.init()
  }

  /**
   * Initialize for a new guidebook execution. Which guidebook depends
   * on: if as given, then as given in props, then as given in
   * client.
   */
  private async init() {
    const guidebook = this.state.guidebook

    if (guidebook === null) {
      return
    }

    try {
      // respawn, meaning launch it with codeflare
      const { argv, env } = await respawn(this.tasks[0].argv)
      const cmdline = [
        ...argv.map((_) => encodeComponent(_)),
        guidebook,
        ...(this.state.noninteractive ? ["--y"] : []),
        ...(this.state.ifor ? ["--ifor", guidebook] : []),
      ]
        .filter(Boolean)
        .join(" ")

      this.setState((curState) => ({
        cmdline,
        hideTerminal: false,
        initCount: curState.initCount + 1,
        env: Object.assign(
          {},
          env,
          {
            /* MWCLEAR_INITIAL: "true" */
          },
          this.state.extraEnv
        ),
      }))
    } catch (error) {
      console.error("Error initializing command line", error)
      this.setState((curState) => ({
        error: true,
        initCount: curState.initCount + 1,
      }))
    }
  }

  /** Event handler for switching to a different profile */
  private readonly onSelectProfile = (selectedProfile: string, profiles?: import("madwizard").Profiles.Profile[]) => {
    this.setState({ selectedProfile })

    if (this.props.onSelectProfile) {
      this.props.onSelectProfile(selectedProfile, profiles)
    }
  }

  /** Event handler for switching to a different guidebook */
  private readonly onSelectGuidebook = (guidebook: string | null | undefined, ifor = true) =>
    this.setState({ hideTerminal: false, guidebook, ifor, noninteractive: false })

  public static getDerivedStateFromProps(props: Props, state: State) {
    if ((props.defaultGuidebook && state.guidebook !== props.defaultGuidebook) || props.extraEnv !== state.extraEnv) {
      // different guidebook or different env vars to be passed to that guidebook
      return {
        ifor: false,
        extraEnv: props.extraEnv,
        guidebook: props.defaultGuidebook,
        noninteractive: props.defaultNoninteractive,
      }
    } else if (props.defaultNoninteractive !== undefined && props.defaultNoninteractive !== state.noninteractive) {
      // different interactivity
      return {
        ifor: false,
        noninteractive: props.defaultNoninteractive,
      }
    }

    return state
  }

  public static getDerivedStateFromError() {
    return { error: true }
  }
  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("catastrophic error", error, errorInfo)
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.guidebook !== this.state.guidebook || prevState.ifor !== this.state.ifor) {
      if (prevState.guidebook === null) {
        this.allotmentRef.current?.reset()
      }
      this.init()
    }
  }

  private readonly _gotit = () => this.setState({ hideTerminal: true })

  private readonly _refresh = () =>
    this.setState({ hideTerminal: false, guidebook: this.props.defaultGuidebook || defaultGuidebookFromClient })

  /** Return to top-level guidebook */
  private readonly _home = (noninteractive = false) => {
    const home = this.props.defaultGuidebook || defaultGuidebookFromClient
    this.onSelectGuidebook(home, false)
    this.setState((curState) => ({ initCount: curState.initCount + 1, noninteractive }))
  }

  private get vertical1() {
    return this.splits.vertical1
  }

  private get vertical2() {
    return !this.state.cmdline || !this.state.env ? this.splits.vertical2b : this.splits.vertical2a
  }

  private noGuidebook() {
    return <Empty refresh={this._refresh} gotit={this._gotit} />
  }

  private readonly allotmentRef = React.createRef<AllotmentHandle>()

  private left() {
    return <ProfileExplorer onSelectProfile={this.onSelectProfile} onSelectGuidebook={this.onSelectGuidebook} />
  }

  private rightTop() {
    return this.props.aboveTerminal
  }

  private rightBottom(selectedProfile: string, guidebook: string) {
    return !this.state.cmdline || !this.state.env ? (
      this.noGuidebook()
    ) : (
      <AskingTerminal
        initCount={this.state.initCount}
        guidebook={guidebook}
        cmdline={this.state.cmdline}
        env={this.state.env}
        selectedProfile={selectedProfile}
        terminalProps={this.props}
        home={this._home}
        noninteractive={this.state.noninteractive}
      />
    )
  }

  private right() {
    const { aboveTerminal } = this.props
    const { hideTerminal, selectedProfile, guidebook } = this.state

    if (!selectedProfile || !guidebook) {
      return <Loading />
    } else {
      return (
        <Allotment
          snap
          vertical
          defaultSizes={hideTerminal || !aboveTerminal ? this.vertical1 : this.vertical2}
          ref={this.allotmentRef}
        >
          {aboveTerminal && <AllotmentFillPane>{this.rightTop()}</AllotmentFillPane>}
          {!hideTerminal && <AllotmentFillPane>{this.rightBottom(selectedProfile, guidebook)}</AllotmentFillPane>}
        </Allotment>
      )
    }
  }

  public render() {
    if (this.state.error) {
      return "Internal Error"
    }

    return (
      <Allotment snap defaultSizes={this.splits.horizontal}>
        <AllotmentFillPane minSize={400}>{this.left()}</AllotmentFillPane>
        <AllotmentFillPane>{this.right()}</AllotmentFillPane>
      </Allotment>
    )
  }
}

class Empty extends React.PureComponent<{ refresh(): void; gotit(): void }> {
  /** Run through all questions again */
  private resubmit() {
    return (
      <Flex>
        <FlexItem>
          <Button variant="secondary" onClick={this.props.gotit}>
            Got it!
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="tertiary" onClick={this.props.refresh}>
            Walk through the constraints again
          </Button>
        </FlexItem>
      </Flex>
    )
  }

  public render() {
    return (
      <EmptyState variant="xs" className="sans-serif flex-fill codeflare--workload-comparo">
        <Title size="lg" headingLevel="h4">
          All constraints satisfied
        </Title>
        <EmptyStateBody>
          All application, compute, and storage constraints have been defined by your Draft Specification.
        </EmptyStateBody>
        <EmptyStatePrimary>{this.resubmit()}</EmptyStatePrimary>
      </EmptyState>
    )
  }
}

/**
 * This is a command handler that opens up a terminal to run a selected profile-oriented task */
export function designer(args: Arguments) {
  return {
    react: <WorkloadDesigner REPL={args.REPL} tab={args.tab} />,
  }
}
