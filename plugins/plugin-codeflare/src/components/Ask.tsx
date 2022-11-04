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
import stripAnsi from "strip-ansi"
import { Prompts, Tree } from "madwizard"

import { Ansi, Tooltip } from "@kui-shell/plugin-client-common"
import {
  ActionGroup,
  Button,
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Grid,
  Form,
  FormGroup,
  SimpleList,
  SimpleListItem,
  TextInput,
  Tile,
} from "@patternfly/react-core"

import HomeIcon from "@patternfly/react-icons/dist/esm/icons/home-icon"
import InfoIcon from "@patternfly/react-icons/dist/esm/icons/info-circle-icon"
import ChoiceIcon from "@patternfly/react-icons/dist/esm/icons/lightbulb-icon"

import "../../web/scss/components/Ask.scss"

/** One choice to present to the user */
export type Ask<P extends Prompts.Prompt = Prompts.Prompt> = {
  /** Title for this ask */
  title: string

  /** Model of what to ask the user */
  prompt: P

  /** Handler for when the user makes a choice */
  onChoose(choice: ReturnType<Tree.AnsiUI["ask"]>): void
}

type Props = {
  ask: Ask
  home(noninteractive?: boolean): void
}

type State = {
  userSelection?: string
}

/**
 * A UI component to present a choice (from madwizard) to the user,
 * and then send the user's selection back.
 *
 */
export default class AskUI extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = {}
  }

  public static getDerivedStateFromProps(props: Props, state: State) {
    if (state.userSelection && props.ask.prompt.choices.find((_) => _.name === state.userSelection)) {
      return state
    } else {
      const suggested = props.ask.prompt.choices.find((_) => (_ as any)["isSuggested"])
      return {
        userSelection: !suggested ? undefined : suggested.name,
      }
    }
  }

  /** User has clicked home button */
  private readonly _home = async (evt: React.MouseEvent) => {
    if (evt.metaKey || evt.altKey) {
      const { Capabilities } = await import("@kui-shell/core")
      if (Capabilities.inBrowser()) {
        window.open(window.location.href)
      } else {
        const { ipcRenderer } = await import("electron")
        ipcRenderer.sendSync(
          "synchronous-message",
          JSON.stringify({
            operation: "new-window",
            argv: ["codeflare", "explore"],
          })
        )
      }
    } else {
      this.props.home()
    }
  }

  /** content to show in the upper right */
  private actions() {
    return (
      <ActionGroup>
        <Tooltip markdown={`### Home\n#### Jump back to the beginning\n\n⌘ or Alt-click to open a new window`}>
          <Button variant="link" icon={<HomeIcon className="larger-text" />} onClick={this._home} />
        </Tooltip>
      </ActionGroup>
    )
  }

  private card(title: string, body: React.ReactNode) {
    return (
      <Card isLarge className="sans-serif flex-fill">
        <CardHeader>
          <CardTitle>
            <div className="flex-layout">
              <ChoiceIcon className="larger-text slightly-deemphasize small-right-pad" /> {title.replace(/\?$/, "")}
            </div>
          </CardTitle>
          <CardActions hasNoOffset>{this.actions()}</CardActions>
        </CardHeader>

        <CardBody className="scrollable scrollable-auto" style={{ paddingTop: "1em" }}>
          {body}
        </CardBody>
      </Card>
    )
  }

  /** Render a simplified set of choices where the message is the same as the title */
  private select(ask: Ask<Prompts.Select>) {
    return this.card(
      ask.title,
      <SimpleList>
        {ask.prompt.choices.map((_) => {
          const isSuggested = this.state?.userSelection === _.name
          return (
            <SimpleListItem
              key={_.name}
              itemId={_.name}
              data-name={_.name}
              isActive={isSuggested}
              onClick={this._onSimpleListClick}
            >
              {_.name}
            </SimpleListItem>
          )
        })}
      </SimpleList>
    )
  }

  private justTheMessage(choice: Ask["prompt"]["choices"][number]) {
    return stripAnsi(choice.message).replace("  ◄ you selected this last time", "")
  }

  /** User has clicked on a simple list item */
  private _onSimpleListClick = (evt: React.MouseEvent | React.ChangeEvent) => {
    const parent = evt.currentTarget.parentElement
    if (parent) {
      const itemId = parent.getAttribute("data-name")
      if (itemId && this.props.ask) {
        this.props.ask.onChoose(Promise.resolve(itemId))
      }
    }
  }

  /** User has clicked to submit a form */
  private readonly _onFormSubmit = (evt: React.SyntheticEvent) => {
    if (this.props.ask) {
      evt.preventDefault()
      this.props.ask.onChoose(Promise.resolve(this._form))
    }
    return false
  }

  /** User has clicked on a tile */
  private readonly _onTileClick = (evt: React.MouseEvent) => {
    const name = evt.currentTarget.getAttribute("data-name")
    if (name && this.props.ask) {
      this.setState({ userSelection: name })
      this.props.ask.onChoose(Promise.resolve(name))
    }
  }

  private tiles(ask: Ask<Prompts.Select>) {
    // is every message the same as the title?
    const isSimplistic = ask.prompt.choices.every(
      (_) => _.name === stripAnsi(_.message).replace("  ◄ you selected this last time", "")
    )
    if (isSimplistic) {
      return this.select(ask)
    }

    return this.card(
      ask.title,
      <Grid hasGutter md={3}>
        {ask.prompt.choices.map((_) => {
          const message = this.justTheMessage(_)
          const isSuggested = this.state?.userSelection === _.name

          //icon={isSuggested && <Icons icon="Info"/>}

          return (
            <Tile
              className="kui--guide-tile"
              isSelected={isSuggested}
              key={_.name}
              title={_.name}
              data-name={_.name}
              data-large={!isSimplistic || undefined}
              isStacked
              onClick={this._onTileClick}
            >
              {message !== _.name && (
                <div>
                  <Ansi noWrap="normal" className="sans-serif">
                    {_.message.split(/\n/).slice(-2)[0]}
                  </Ansi>
                </div>
              )}
              {isSuggested && (
                <div className="top-pad color-base0D">
                  <InfoIcon /> You selected this last time
                </div>
              )}
            </Tile>
          )
        })}
      </Grid>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private checkboxes(ask: Ask<Prompts.MultiSelect>) {
    console.error("!!!!!!MMM", ask.prompt)
    return "multiselect"
  }

  private _form: Record<string, string> = {}

  private form(ask: Ask<Prompts.Form>) {
    const form = ask.prompt.choices.reduce((M, _) => {
      M[_.name] = (_ as any)["initial"]
      return M
    }, {} as Record<string, string>)
    this._form = form

    return this.card(
      ask.title,
      <Form onSubmit={this._onFormSubmit}>
        <Grid hasGutter md={6}>
          {ask.prompt.choices.map((_) => (
            <FormGroup isRequired key={_.name} label={_.name}>
              <TextInput
                aria-label={`text-input-${_.name}`}
                isRequired
                value={form[_.name]}
                onChange={(value) => (form[_.name] = value)}
              />
            </FormGroup>
          ))}
        </Grid>

        <ActionGroup>
          <Button variant="primary" type="submit">
            Next
          </Button>
        </ActionGroup>
      </Form>
    )
  }

  private isSelect(ask: Ask): ask is Ask<Prompts.Select> {
    return Prompts.isSelect(ask.prompt)
  }

  private isMultiSelect(ask: Ask): ask is Ask<Prompts.MultiSelect> {
    return Prompts.isMultiSelect(ask.prompt)
  }

  private ask(ask: Ask) {
    if (this.isSelect(ask)) {
      return this.tiles(ask)
    } else if (this.isMultiSelect(ask)) {
      return this.checkboxes(ask)
    } else {
      return this.form(ask)
    }
  }

  public render() {
    return (
      <div className="kui--madwizard-ask-ui flex-fill flex-layout flex-align-stretch">{this.ask(this.props.ask)}</div>
    )
  }
}
