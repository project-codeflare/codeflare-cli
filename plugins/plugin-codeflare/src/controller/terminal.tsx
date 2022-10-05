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
import { Allotment } from "allotment"
import { Loading } from "@kui-shell/plugin-client-common"
import { Arguments, encodeComponent } from "@kui-shell/core"
import { defaultGuidebook as defaultGuidebookFromClient } from "@kui-shell/client/config.d/client.json"

import respawn from "./respawn"

import ProfileExplorer from "../components/ProfileExplorer"
import SelectedProfileTerminal from "../components/SelectedProfileTerminal"
import Terminal, { Props as BaseProps } from "../components/RestartableTerminal"

import "../../web/scss/components/Allotment/_index.scss"
import "allotment/dist/style.css"

// codeflare -p ${SELECTED_PROFILE}

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

export type Props = Pick<BaseProps, "tab" | "REPL" | "onExit"> & {
  /** Default guidebook (if not given, we will take the value from the client definition) */
  defaultGuidebook?: string

  /** Run guidebook in non-interactive mode? */
  defaultNoninteractive?: boolean

  /** Any extra env vars to add to the guidebook execution. These will be pre-joined with the default env. */
  extraEnv?: BaseProps["env"]

  /** Callback when user selects a profile */
  onSelectProfile?(profile: string, profiles?: import("madwizard").Profiles.Profile[]): void

  /** Content to place below the terminal */
  belowTerminal?: React.ReactNode
}

type State = Partial<Pick<BaseProps, "cmdline" | "env">> & {
  /** Number of times we have called this.init() */
  initCount: number

  /** Internal error in rendering */
  error?: boolean

  /** Use this guidebook in the terminal execution */
  guidebook?: string

  /** Run guidebook in non-interactive mode? */
  noninteractive?: boolean

  /** Interactive only for the given guidebook? */
  ifor?: boolean

  /** Use this profile in the terminal execution */
  selectedProfile?: string
}

export class TaskTerminal extends React.PureComponent<Props, State> {
  /** Allotment initial split ... allotments */
  private readonly splits = {
    horizontal: [35, 65],
    vertical1: [100], // no `this.props.belowTerminal`
    vertical2: [50, 50], // yes
  }

  private readonly tasks = [{ label: "Run a Job", argv: ["codeflare", "-p", "${SELECTED_PROFILE}"] }]

  public constructor(props: Props) {
    super(props)

    this.state = { initCount: 0, guidebook: defaultGuidebookFromClient }
    this.init()
  }

  /**
   * Initialize for a new guidebook execution. Which guidebook depends
   * on: if as given, then as given in props, then as given in
   * client.
   */
  private async init() {
    const guidebook = this.state.guidebook

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
        initCount: curState.initCount + 1,
        env: Object.assign({}, env, { MWCLEAR_INITIAL: "true" }, this.props.extraEnv),
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
  private readonly onSelectGuidebook = (guidebook: string) =>
    this.setState({ guidebook, ifor: true, noninteractive: false })

  public static getDerivedStateFromProps(props: Props, state: State) {
    if (props.defaultGuidebook && state.guidebook !== props.defaultGuidebook) {
      return {
        ifor: false,
        guidebook: props.defaultGuidebook,
        noninteractive: props.defaultNoninteractive,
      }
    } else if (props.defaultNoninteractive !== state.noninteractive) {
      return {
        ifor: false,
        noninteractive: props.defaultNoninteractive,
      }
    }

    return
  }

  public static getDerivedStateFromError() {
    return { error: true }
  }
  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("catastrophic error", error, errorInfo)
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.guidebook !== this.state.guidebook || prevState.ifor !== this.state.ifor) {
      this.init()
    }
  }

  public render() {
    if (this.state.error) {
      return "Internal Error"
    } else if (!this.state.cmdline || !this.state.env) {
      return <Loading />
    }

    return (
      <Allotment defaultSizes={this.splits.horizontal} snap>
        <AllotmentFillPane minSize={400}>
          <ProfileExplorer onSelectProfile={this.onSelectProfile} onSelectGuidebook={this.onSelectGuidebook} />
        </AllotmentFillPane>
        <AllotmentFillPane>
          {!this.state.selectedProfile ? (
            <Loading />
          ) : (
            <Allotment
              vertical
              defaultSizes={!this.props.belowTerminal ? this.splits.vertical1 : this.splits.vertical2}
              snap
            >
              <AllotmentFillPane>
                <SelectedProfileTerminal
                  key={this.state.initCount + "_" + this.state.cmdline + "-" + this.state.selectedProfile}
                  cmdline={this.state.cmdline}
                  env={this.state.env}
                  {...this.props}
                  selectedProfile={this.state.selectedProfile}
                />
              </AllotmentFillPane>
              {this.props.belowTerminal && <AllotmentFillPane>{this.props.belowTerminal}</AllotmentFillPane>}
            </Allotment>
          )}
        </AllotmentFillPane>
      </Allotment>
    )
  }
}

/**
 * This is a command handler that opens up a terminal to run a selected profile-oriented task */
export function task(args: Arguments) {
  return {
    react: <TaskTerminal REPL={args.REPL} tab={args.tab} />,
  }
}
