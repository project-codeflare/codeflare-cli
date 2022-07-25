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

import { cli } from "madwizard/dist/fe/cli"
import { CreateWindowFunction } from "@kui-shell/core"

import windowOptions from "../../../window"

interface DashboardSpec {
  /** Label for presentation e.g. "MLFlow" or "Tensorboard" */
  name: string

  /** If absent, the guidebook is of the form "ml/<name.toLowerCase()>/start/kubernetes/port-forward"; you can provide the full path instead */
  guidebook?: string

  /** Name of environment variable that stores the dashboard port */
  portEnv: string
}

export default async function openDashboard(
  { name, guidebook = `ml/${name.toLowerCase()}/start/kubernetes/port-forward`, portEnv }: DashboardSpec,
  profile: string,
  createWindow: CreateWindowFunction
) {
  const resp = await cli(["madwizard", "guide", guidebook], undefined, {
    clean: false /* don't kill the port-forward subprocess! we'll manage that */,
    interactive: false,
    store: process.env.GUIDEBOOK_STORE,
  })

  if (resp) {
    if (!resp.env[portEnv]) {
      console.error(`Unable to open ${name}, due to an error in connecting to the remote server`)
    } else {
      // the `createWindow` api returns a promise that will resolve
      // when the window closes
      await createWindow(
        "http://localhost:" + resp.env[portEnv],
        windowOptions({ title: `${name} Dashboard - ` + profile }) // might not matter, as most dashboards have their own title
      )

      // now the window has closed, so we can clean up any
      // subprocesses spawned by the guidebook
      if (typeof resp.cleanExit === "function") {
        resp.cleanExit()
      }
    }
  }
}
