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

import { Profiles } from "madwizard"
import { basename, join } from "path"
import { cli } from "madwizard/dist/fe/cli"
import { MenuItemConstructorOptions } from "electron"
import { CreateWindowFunction } from "@kui-shell/core"

import { rayIcon } from "../../icons"
import UpdateFunction from "../../update"
import ProfileActiveRunWatcher from "../../watchers/profile/active-runs"

import { runMenuItems } from "./runs"

/** active run watcher per profile */
const watchers: Record<string, ProfileActiveRunWatcher> = {}

/** This is the utility function that will open a CodeFlare Dashboard window, pointing to the given local filesystem `logdir` */
async function openDashboard(createWindow: CreateWindowFunction, logdir: string, follow = true) {
  await createWindow(["codeflare", "dashboard", follow ? "-f" : "", logdir], {
    title: "CodeFlare Dashboard - " + basename(logdir),
  })
}

/** This is the click handler for a an active run menu item */
async function openMenuItem(this: CreateWindowFunction, profile: string, runId: string) {
  // check to see if we already have a log aggregator's capture
  const logdir = join(Profiles.guidebookJobDataPath({ profile }), runId)
  if (
    await import("fs/promises")
      .then((_) => _.access(logdir))
      .then(() => true)
      .catch(() => false)
  ) {
    // yup, so we can just open up what we are capturing/have
    // already captured
    return openDashboard(this, logdir)
  }

  // otherwise, we will need to start of a log aggregator
  const guidebook = "ml/ray/aggregator/with-jobid"
  const rayAddress = await watchers[profile].rayAddress
  if (rayAddress) {
    process.env.JOB_ID = runId
    process.env.RAY_ADDRESS = rayAddress
    process.env.NO_WAIT = "true" // don't wait for job termination
    process.env.QUIET_CONSOLE = "true" // don't tee logs to the console
    const resp = await cli(["madwizard", "guide", guidebook], undefined, {
      profile,
      clean: false /* don't kill the port-forward subprocess! we'll manage that */,
      interactive: false,
      store: process.env.GUIDEBOOK_STORE,
    })

    if (resp) {
      if (!resp.env.LOGDIR_STAGE) {
        console.error("Failed to attach to job", runId)
      } else {
        await openDashboard(this, resp.env.LOGDIR_STAGE)

        // now the window has closed, so we can clean up any
        // subprocesses spawned by the guidebook
        if (typeof resp.cleanExit === "function") {
          resp.cleanExit()
          process.on("exit", () => resp.cleanExit())
        }
      }
    }
  }
}

/** @return menu items that allow attaching to an active run in the given `profileName` */
export default function activeRuns(
  profile: string,
  createWindow: CreateWindowFunction,
  updateFn: UpdateFunction
): MenuItemConstructorOptions[] {
  if (!watchers[profile]) {
    watchers[profile] = new ProfileActiveRunWatcher(updateFn, profile)
  }

  const runs = watchers[profile].runs
  if (runs.length > 0) {
    return runMenuItems(
      profile,
      openMenuItem.bind(createWindow),
      runs.map((_) => Object.assign(_, { icon: rayIcon }))
    )
  } else {
    return [{ label: "No active runs", enabled: false }]
  }
}
