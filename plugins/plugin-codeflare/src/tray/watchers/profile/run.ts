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

import { readdir } from "fs/promises"
import { Profiles } from "madwizard"

export const RUNS_ERROR = "No runs found"

/**
 * Maintain the set of runs for `this.profile`
 *
 * TODO make this actually watch
 */
export default class ProfileRunWatcher {
  private _runs: string[] = []

  public constructor(private readonly profile: string) {}

  /** Initialize `this._runs` model */
  public async init() {
    await this.readRunsDir()
    return this
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
  private async readRunsDir() {
    try {
      // TODO do a "full" read with Dirents, so that we have filesystem
      // timestamps, and sort, so that the `.slice(0, 10)` below pulls
      // out the most recent runs
      this.runs = await readdir(Profiles.guidebookJobDataPath({ profile: this.profile }))
    } catch (err) {
      this.runs = [RUNS_ERROR]
    }
  }
}
