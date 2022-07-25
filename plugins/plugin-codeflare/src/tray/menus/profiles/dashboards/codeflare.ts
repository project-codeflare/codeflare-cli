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

import { join } from "path"
import { Profiles } from "madwizard"
import { MenuItemConstructorOptions } from "electron"
import { CreateWindowFunction } from "@kui-shell/core"

import runs from "../runs"
import section from "../../section"
import windowOptions from "../../../window"

/** @return a new Window with a dashboard of the selected job run */
function openRunInCodeflareDashboard(createWindow: CreateWindowFunction, profile: string, runId: string) {
  const runsDir = Profiles.guidebookJobDataPath({ profile })
  createWindow(
    ["codeflare", "dashboard", join(runsDir, runId)],
    windowOptions({ title: "CodeFlare Dashboard - " + runId })
  )
}

export default async function codeflareDashboards(
  profile: string,
  createWindow: CreateWindowFunction
): Promise<MenuItemConstructorOptions[]> {
  return [
    {
      label: "Run Summary",
      click: () =>
        createWindow(["codeflare", "get", "run", "--profile", profile], {
          title: "Codeflare Run Summary - " + profile,
        }),
    },
    ...section("Recent Runs", await runs(profile, openRunInCodeflareDashboard.bind(undefined, createWindow))),
  ]
}
