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

import Debug from "debug"
import { spawn } from "child_process"
import { encodeComponent } from "@kui-shell/core"

import UpdateFunction from "../../update"
import respawnCommand from "../../../controller/respawn"

/** Watches a given profile for changing status */
export default class ProfileStatusWatcher {
  private headReadiness = "pending"
  private workerReadiness = "pending"
  private readonly _job: ReturnType<typeof spawn>

  public constructor(
    /** The profile to watch */
    private readonly profile: any,

    /** How to update the Tray menu with changes*/
    private readonly updateFunction: UpdateFunction
  ) {
    this._job = this.initJob(profile)
  }

  public get readiness() {
    return this.headReadiness
  }

  public get head() {
    return { label: `Head nodes: ${this.headReadiness}` }
  }

  public get workers() {
    return { label: `Worker nodes: ${this.workerReadiness}` }
  }

  private async initJobWithDelay(profile: string, delayMillis = 0) {
    if (delayMillis) {
      // delayed start
      await new Promise((resolve) => setTimeout(resolve, delayMillis))
    }
    return this.initJob(profile)
  }

  private initJob(profile: string) {
    console.error("Watcher start", profile)
    const { argv, env } = respawnCommand([
      "guide",
      "-q",
      "-y",
      "--profile",
      encodeComponent(profile),
      "ml/ray/cluster/kubernetes/is-ready",
    ])
    const job = spawn(argv[0], argv.slice(1), { env, stdio: ["pipe", "pipe", "inherit"], detached: true })

    // make sure to kill that watcher subprocess when we exit
    process.on("exit", () => {
      try {
        process.kill(-job.pid) // kill the process group e.g. for pipes
      } catch (err) {
        Debug("codeflare")("error killing process group " + -job.pid, err)
      }

      try {
        job.kill()
      } catch (err) {
        Debug("codeflare")("error killing process " + job.pid, err)
      }
    })

    job.on("error", () => {
      Debug("codeflare")("Watcher error", profile)
      this.headReadiness = "error"
      this.workerReadiness = "error"
      this.initJobWithDelay(profile, 2000) // restart after a delay
    })

    job.on("close", async (exitCode) => {
      Debug("codeflare")("Watcher exited with code", exitCode)
      this.initJobWithDelay(profile, 2000) // restart after a delay
    })

    job.stdout.on("data", (data) => {
      data
        .toString()
        .split(/\n/)
        .forEach((line: string) => {
          const match = line.match(/^(head|workers)\s+(\S+)$/)
          if (!match) {
            // console.error('Bogus line emitted by ray cluster readiness probe', line)
          } else {
            if (match[1] === "head") {
              this.headReadiness = match[2]
            } else if (match[1] === "workers") {
              this.workerReadiness = match[2]
            } else {
              console.error("Bogus line emitted by ray cluster readiness probe", line)
            }
          }
        })

      this.updateFunction()
    })

    return job
  }
}
