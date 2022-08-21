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

import { MenuItemConstructorOptions } from "electron"
import { CreateWindowFunction } from "@kui-shell/core"
import { productName } from "@kui-shell/client/config.d/name.json"

import { rayIcon } from "../../icons"
import UpdateFunction from "../../update"
import ProfileActiveRunWatcher from "../../watchers/profile/active-runs"

import { runMenuItems } from "./runs"

/** active run watcher per profile */
const watchers: Record<string, ProfileActiveRunWatcher> = {}

/** This is the utility function that will open a CodeFlare Dashboard window and attaches to the given job */
async function openDashboard(createWindow: CreateWindowFunction, profile: string, runId: string, follow = true) {
  await createWindow(["codeflare", "dashboard", follow ? "-f" : "", "-a", runId, "-p", profile], {
    title: productName + " Dashboard - " + runId,
  })
}

/** This is the click handler for a an active run menu item */
async function openMenuItem(this: CreateWindowFunction, profile: string, runId: string) {
  // check to see if we already have a log aggregator's capture
  /* const logdir = join(Profiles.guidebookJobDataPath({ profile }), runId)
  if (
    await import("fs/promises")
      .then((_) => _.access(logdir))
      .then(() => true)
      .catch(() => false)
  ) {
    // yes, we already have a local capture, so we can just open up
    // what we are capturing/have already captured
    //
    // FIXME: is this right? what we the local capture is out of date?
    return openDashboard(this, logdir)
    } */
  // ^^^ disabled... due to the FIXME

  // otherwise, we will need to start of a log aggregator
  /* process.env.NO_WAIT = "true" // don't wait for job termination
  process.env.QUIET_CONSOLE = "true" // don't tee logs to the console
  const { attach } = await import("../../../controller/attach")
  const { logdir, cleanExit } = await attach(profile, runId, { verbose: true })

  if (!logdir) {
    console.error("Failed to attach to job", runId)
  } else {
    if (typeof cleanExit === "function") {
      process.on("exit", () => cleanExit())
    }

    await openDashboard(this, logdir)

    // now the window has closed, so we can clean up any
    // subprocesses spawned by the guidebook
    if (typeof cleanExit === "function") {
      cleanExit()
    }
    } */
  await openDashboard(this, profile, runId)
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
