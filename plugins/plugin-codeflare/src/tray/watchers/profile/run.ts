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

import chokidar from "chokidar"
import { basename } from "path"

import { readdir } from "fs/promises"
import { Profiles } from "madwizard"

import UpdateFunction from "../../update"

export const RUNS_ERROR = "No runs found"

/**
 * Maintain the set of runs for `this.profile`
 *
 * TODO make this actually watch
 */
export default class ProfileRunWatcher {
  /** Our model */
  private _runs: string[] = []

  /** Have we already performed the on-time init? */
  private _initDone = false

  public constructor(
    private readonly updateFn: UpdateFunction,
    private readonly profile: string,
    private readonly watcher = chokidar.watch(ProfileRunWatcher.path(profile) + "/*", { depth: 1 })
  ) {}

  private static path(profile: string) {
    return Profiles.guidebookJobDataPath({ profile })
  }

  /** Initialize `this._runs` model */
  public async init(): Promise<ProfileRunWatcher> {
    if (!this._initDone) {
      // await this.readOnce() no need, since chokidar gives us an initial read
      this.initWatcher()
      this._initDone = true
    }
    return this
  }

  /** Initialize the filesystem watcher to notify us of new or removed profiles */
  private initWatcher() {
    this.watcher.on("addDir", async (path) => {
      const runId = basename(path)
      const idx = this.runs.findIndex((_) => _ === runId)
      if (idx < 0) {
        this._runs.push(runId)
        this.updateFn()
      }
    })

    this.watcher.on("unlink", (path) => {
      const runId = basename(path)
      const idx = this.runs.findIndex((_) => _ === runId)
      if (idx >= 0) {
        this._runs.splice(idx, 1)
        this.updateFn()
      }
    })
  }

  /** @return the current runs model */
  public get runs() {
    return this._runs
  }

  /** Overwrite the run model state */
  private set runs(runs: string[]) {
    this._runs = runs
  }

  /** @return files of the directory of job runs for a given profile */
  private async readOnce() {
    try {
      // TODO do a "full" read with Dirents, so that we have filesystem
      // timestamps, and sort, so that the `.slice(0, 10)` below pulls
      // out the most recent runs
      this.runs = await readdir(ProfileRunWatcher.path(this.profile))
    } catch (err) {
      this.runs = [RUNS_ERROR]
    }
  }
}
