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
import { Prompts, Tree } from "madwizard"
import { cli } from "madwizard/dist/fe/cli"
import { Loading } from "@kui-shell/plugin-client-common"

import AskUI, { Ask } from "./Ask"
import { guidebookStore } from "../controller/respawn"

type Props = {
  guidebook: string
}

type State = {
  /** Catastrophic error in rendering? */
  error?: Error

  /** Are we currently asking the user a question? */
  ask?: Ask

  /** Current guidebook we have launched madwizard against */
  currentGuidebook: string
}

class UI extends Tree.AnsiUI {
  public constructor(private readonly onAsk: (prompt: Prompts.Prompt, onChoose: Ask["onChoose"]) => void) {
    super()
  }

  public markdown(body: string) {
    return body
  }

  // Promise<string | Record<string, string>
  public async ask(prompt: Prompts.Prompt): ReturnType<Tree.AnsiUI["ask"]> {
    return new Promise((resolve, reject) => {
      try {
        this.onAsk(prompt, resolve)
      } catch (err) {
        reject(err)
      }
    })
  }
}

/**
 * Launch a guidebook in "raw" mode (so that we can receive asks from
 * madwizard, and present them via the <AskUI/>, and send user
 * responses back to madwizard. All of the ui rendering is done by
 * <AskUI/>.
 *
 */
export default class Guide extends React.PureComponent<Props, State> {
  private readonly ui = new UI(this.onAsk.bind(this))

  public constructor(props: Props) {
    super(props)
    this.state = {
      currentGuidebook: props.guidebook,
    }
  }

  public static getDerivedStateFromProps(props: Props) {
    return {
      currentGuidebook: props.guidebook,
    }
  }

  private readonly _home = () => this.setState({ currentGuidebook: this.props.guidebook })

  /** Guidebook runner presents a question to the user */
  private async onAsk(prompt: Prompts.Prompt, onChoose: (choice: ReturnType<Tree.AnsiUI["ask"]>) => void) {
    this.setState({ ask: { prompt, onChoose, title: prompt.name || "Make a Choice" } })
  }

  private async init() {
    try {
      await cli(["codeflare", "guide", this.props.guidebook], undefined, { store: await guidebookStore() }, this.ui)
    } catch (error) {
      console.error(error)
      this.setState({ error: error as Error })
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.currentGuidebook !== this.state.currentGuidebook) {
      this.init()
    }
  }

  public componentDidMount() {
    this.init()
  }

  public render() {
    if (this.state.error) {
      return "Internal Error"
    } else if (!this.state.ask) {
      return <Loading />
    } else {
      return <AskUI ask={this.state.ask} home={this._home} />
    }
  }
}
