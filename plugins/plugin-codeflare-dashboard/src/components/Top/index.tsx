/*
 * Copyright 2023 The Kubernetes Authors
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

import Debug from "debug"
import React from "react"
import { emitKeypressEvents } from "readline"
import { Box, Text, render } from "ink"

import type Group from "./Group.js"
import type {
  Context,
  ChangeContextRequestHandler,
  WatcherInitializer,
  UpdateError,
  UpdatePayload,
  UpdatePayloadOrError,
  ResourceSpec,
} from "./types.js"

import Header from "./Header.js"
import JobBox from "./JobBox.js"
import { isError } from "./types.js"
import defaultValueFor from "./defaults.js"

type UI = {
  /** Force a refresh */
  refreshCycle?: number
}

type Props = UI &
  Context /* initial context */ & {
    /** UI is ready to consume model updates */
    initWatcher: WatcherInitializer

    /** Ui wants to change context */
    changeContext: ChangeContextRequestHandler
  }

type State = UI & {
  /** Current watcher */
  watcher: { kill(): void }

  /** Model from controller */
  rawModel: UpdatePayload

  /** Error in updating model? */
  updateError: null | UpdateError

  /** Our grouping of `rawModel` */
  groups: Group[]

  /** Currently selected group */
  selectedGroupIdx: number

  /** Refresh interval so we can update durations */
  refreshCycle: number

  /** Refresher interval */
  refresher: ReturnType<typeof setInterval>
}

class Top extends React.PureComponent<Props, State> {
  /**
   * % is remainder, we want modulo
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
   */
  private mod(n: number, d: number) {
    return ((n % d) + d) % d
  }

  /** Indicates the absence of a job selection */
  private get NO_SELECTION() {
    return -1
  }

  /** Do we have a selected group? */
  private get hasSelection() {
    return this.state?.selectedGroupIdx >= 0 && this.state?.selectedGroupIdx < this.state.groups.length
  }

  private clearCurrentJobSelection() {
    this.setState({ selectedGroupIdx: this.NO_SELECTION })
  }

  /** Current cluster context */
  private get currentContext() {
    return {
      context: this.state?.rawModel?.context || this.props.context,
      cluster: this.state?.rawModel?.cluster || this.props.cluster,
      namespace: this.state?.rawModel?.namespace || this.props.namespace,
    }
  }

  public async componentDidMount() {
    this.setState({ watcher: await this.props.initWatcher(this.currentContext, this.onData) })

    this.initRefresher()
    this.initKeyboardEvents()
  }

  public componentWillUnmount() {
    this.cleanupRefresher()
    this.cleanupKeyboardEvents()
  }

  /** So we can update the job age UI even without updates from the controller */
  private initRefresher() {
    this.setState({
      refresher: setInterval(
        () => this.setState((curState) => ({ refreshCycle: (curState?.refreshCycle || 0) + 1 })),
        10000
      ),
    })
  }

  private cleanupRefresher() {
    if (this.state?.refresher) {
      clearInterval(this.state.refresher)
    }
  }

  private cleanupKeyboardEvents() {
    if (process.stdin.isTTY) {
      // TODO do we also need to exit raw mode on ctrl+c?
      process.stdin.setRawMode(false)
    }
  }

  private async cycleThroughContexts(which: "namespace" | "cluster", dir: "up" | "down") {
    if (this.currentContext) {
      const updatedContext = await this.props.changeContext({ which, context: this.currentContext, dir })

      if (updatedContext) {
        this.reinit(updatedContext)
      }
    }
  }

  private cycleThroughJobs(dir: "left" | "right") {
    if (this.state.groups) {
      const incr = dir === "left" ? -1 : 1
      this.setState((curState) => ({
        selectedGroupIdx:
          curState?.selectedGroupIdx === undefined
            ? 0
            : this.mod(curState.selectedGroupIdx + incr, curState.groups.length + 1),
      }))
    }
  }

  /** Handle keyboard events from the user */
  private initKeyboardEvents() {
    if (!process.stdin.isTTY) {
      return
    }

    // these are necessary to get keypress events on process.stdin
    emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)

    process.stdin.on("keypress", (str, key) => {
      if (key.ctrl && key.name === "c") {
        process.exit()
      } else if (key.ctrl && key.name === "l") {
        this.setState((curState) => ({ refreshCycle: (curState?.refreshCycle || 0) + 1 }))
      } else {
        switch (key.name) {
          case "escape":
            this.clearCurrentJobSelection()
            break

          case "up":
          case "down":
            this.cycleThroughContexts("namespace", key.name)
            break

          case "pageup":
          case "pagedown":
            this.cycleThroughContexts("cluster", key.name === "pageup" ? "up" : "down")
            break

          case "left":
          case "right":
            this.cycleThroughJobs(key.name)
            break
        }
      }
    })
  }

  private get emptyStats(): UpdatePayload["stats"] {
    return { min: { cpu: 0, mem: 0, gpu: 0 }, tot: {} }
  }

  private async reinit(context: Context) {
    if (this.state?.watcher) {
      this.state?.watcher.kill()
    }
    this.setState({
      groups: [],
      updateError: null,
      selectedGroupIdx: this.NO_SELECTION,
      watcher: await this.props.initWatcher(context, this.onData),
      rawModel: Object.assign({ hosts: [], stats: this.emptyStats }, context),
    })
  }

  /** We have received data from the controller */
  private readonly onData = (rawModel: UpdatePayloadOrError) => {
    if (rawModel.cluster !== this.currentContext.cluster || rawModel.namespace !== this.currentContext.namespace) {
      // this is straggler data from the prior context
      return
    } else if (isError(rawModel)) {
      // update error
      if (!this.state?.updateError || JSON.stringify(rawModel) !== JSON.stringify(this.state.updateError)) {
        this.setState({ updateError: rawModel })
      }
    } else {
      // good update from current context
      this.setState((curState) => {
        if (JSON.stringify(curState?.rawModel) === JSON.stringify(rawModel)) {
          return null
        } else {
          return { rawModel, groups: this.groupBy(rawModel) }
        }
      })
    }
  }

  private groupBy(model: UpdatePayload): State["groups"] {
    return Object.values(
      model.hosts.reduce((M, host) => {
        host.jobs.forEach((job) => {
          const key = job.name
          if (!M[key]) {
            M[key] = {
              job,
              ctime: Date.now(),
              hosts: [],
              pods: [],
              stats: { min: model.stats.min, tot: { cpu: 0, mem: 0, gpu: 0 } },
            }
          }

          M[key].hosts.push(host)
          M[key].pods = [...M[key].pods, ...job.pods]
          M[key].ctime = Math.min(M[key].ctime, ...job.pods.map((_) => _.ctime))
          M[key].stats.tot.cpu += job.pods.reduce((tot, pod) => (tot += this.mostOf(pod.cpu, defaultValueFor.cpu)), 0)
          M[key].stats.tot.mem += job.pods.reduce((tot, pod) => (tot += this.mostOf(pod.mem, defaultValueFor.mem)), 0)
          M[key].stats.tot.gpu += job.pods.reduce((tot, pod) => (tot += this.mostOf(pod.gpu, defaultValueFor.gpu)), 0)
        })

        return M
      }, {} as Record<string, Omit<State["groups"][number], "groupIdx">>)
    )
      .sort(this.sorter)
      .map((group, groupIdx) => Object.assign(group, { groupIdx }))
  }

  private readonly sorter = (a: Omit<Group, "groupIdx">, b: Omit<Group, "groupIdx">) => {
    return (
      a.stats.tot.cpu + a.stats.tot.mem + a.stats.tot.gpu - (b.stats.tot.cpu + b.stats.tot.mem + b.stats.tot.gpu) ||
      a.job.name.localeCompare(b.job.name)
    )
  }

  private mostOf({ request, limit }: ResourceSpec, defaultValue: number) {
    if (request === -1 && limit === -1) {
      return defaultValue
    } else if (request === -1) {
      return limit
    } else if (limit === -1) {
      return request
    } else {
      return Math.max(request, limit)
    }
  }

  private body() {
    if (this.state?.updateError) {
      return <Text color="red">{this.state.updateError.message}</Text>
    } else if (this.state.groups.length === 0) {
      return <Text>No active jobs</Text>
    } else {
      return (
        <Box flexWrap="wrap">
          {this.state.groups.map((group) => (
            <JobBox
              key={group.job.name}
              group={group}
              isSelected={!this.hasSelection ? "no-selection" : this.state?.selectedGroupIdx === group.groupIdx}
              min={this.state.rawModel.stats.min}
            />
          ))}
        </Box>
      )
    }
  }

  public render() {
    if (!this.state?.updateError && !this.state?.groups) {
      // TODO spinner? this means we haven't received the first data set, yet
      return <React.Fragment />
    } else {
      return (
        <Box flexDirection="column">
          <Header {...this.currentContext} />
          <Box marginTop={1}>{this.body()}</Box>
        </Box>
      )
    }
  }
}

export default async function renderTop(props: Props) {
  const debug = Debug("plugin-codeflare-dashboard/components/Top")

  debug("rendering")
  const { waitUntilExit } = await render(<Top {...props} />)
  debug("initial render done")
  await waitUntilExit()
}
