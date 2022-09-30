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
import { defaultGuidebook } from "@kui-shell/client/config.d/client.json"

import respawn from "./respawn"

import ProfileExplorer from "../components/ProfileExplorer"
import SelectedProfileTerminal from "../components/SelectedProfileTerminal"
import Terminal, { Props as BaseProps } from "../components/RestartableTerminal"

import "allotment/dist/style.css"

// codeflare -p ${SELECTED_PROFILE}

/**
 * This is a command handler that opens up a plain terminal that shows a login session using the user's $SHELL.
 */
export async function shell(args: Arguments) {
  // respawn, meaning launch it with codeflare
  const { argv, env } = await respawn(["$SHELL", "-l"])
  const cmdline = argv.map((_) => encodeComponent(_)).join(" ")

  return {
    react: <Terminal cmdline={cmdline} env={env} repl={args.REPL} tab={args.tab} />,
  }
}

type Props = Pick<BaseProps, "tab" | "repl"> & {
  onSelectProfile?(profile: string, profiles?: import("madwizard").Profiles.Profile[]): void
}

type State = Partial<Pick<BaseProps, "cmdline" | "env">> & {
  /** Internal error in rendering */
  error?: boolean

  /** Use this guidebook in the terminal execution */
  guidebook?: string

  /** Use this profile in the terminal execution */
  selectedProfile?: string
}

export class TaskTerminal extends React.PureComponent<Props, State> {
  /** Allotment initial split sizes */
  private readonly sizes = [40, 60]

  private readonly tasks = [{ label: "Run a Job", argv: ["codeflare", "-p", "${SELECTED_PROFILE}"] }]

  public constructor(props: Props) {
    super(props)

    this.init()
    this.state = {}
  }

  private async init(guidebook?: string) {
    try {
      // respawn, meaning launch it with codeflare
      const { argv, env } = await respawn(this.tasks[0].argv)
      const cmdline = [
        ...argv.map((_) => encodeComponent(_)),
        guidebook || defaultGuidebook,
        ...(guidebook ? ["--ifor", guidebook] : []),
      ]
        .filter(Boolean)
        .join(" ")

      this.setState({
        cmdline,
        env: Object.assign({}, env, { MWCLEAR: "true" }),
      })
    } catch (error) {
      console.error("Error initializing command line", error)
      this.setState({
        error: true,
      })
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
  private readonly onSelectGuidebook = (guidebook: string) => this.init(guidebook)

  public static getDerivedStateFromError() {
    return { error: true }
  }
  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("catastrophic error", error, errorInfo)
  }

  public render() {
    if (this.state.error) {
      return "Internal Error"
    } else if (!this.state.cmdline || !this.state.env) {
      return <Loading />
    }

    return (
      <Allotment defaultSizes={this.sizes} snap>
        <Allotment.Pane className="flex-fill flex-layout flex-align-stretch" minSize={400}>
          <ProfileExplorer onSelectProfile={this.onSelectProfile} onSelectGuidebook={this.onSelectGuidebook} />
        </Allotment.Pane>
        <Allotment.Pane className="flex-fill flex-layout flex-align-stretch">
          {!this.state.selectedProfile ? (
            <Loading />
          ) : (
            <SelectedProfileTerminal
              key={this.state.cmdline + "-" + this.state.selectedProfile}
              cmdline={this.state.cmdline}
              env={this.state.env}
              {...this.props}
              selectedProfile={this.state.selectedProfile}
            />
          )}
        </Allotment.Pane>
      </Allotment>
    )
  }
}

/**
 * This is a command handler that opens up a terminal to run a selected profile-oriented task */
export function task(args: Arguments) {
  return {
    react: <TaskTerminal repl={args.REPL} tab={args.tab} />,
  }
}
