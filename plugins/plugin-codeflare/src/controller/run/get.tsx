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
import { join } from "path"
import { readdir } from "fs"
import { Profiles } from "madwizard"
import { Grid, GridItem, Tile } from "@patternfly/react-core"
import { Arguments, ReactResponse } from "@kui-shell/core"

import { width, height } from "../dashboard"
import { getJobDefinition } from "../description"

async function openDashboard(this: Arguments["REPL"], evt: React.MouseEvent<HTMLDivElement>) {
  const runDir = evt.currentTarget.getAttribute("data-run-dir")
  if (runDir) {
    const { ipcRenderer } = await import("electron")
    ipcRenderer.send(
      "synchronous-message",
      JSON.stringify({
        operation: "new-window",
        title: "Dashboard",
        width,
        height,
        argv: ["codeflare", "dashboardui", runDir],
      })
    )
  }
}

export default async function getProfiles(args: Arguments) {
  const onClick = openDashboard.bind(args.REPL)

  return new Promise<ReactResponse>((resolve, reject) => {
    const runsDir = Profiles.guidebookJobDataPath({})
    readdir(runsDir, async (err, runs) => {
      if (err) {
        if (err.code === "ENOENT") {
          return "No runs to show"
        } else {
          reject(err)
        }
      } else {
        const runDirs = runs.map((_) => join(runsDir, _))
        const details = (await Promise.all(runDirs.map((_) => getJobDefinition(_, args.REPL))))
          .map((info, idx) => ({
            jobId: runs[idx],
            runDir: runDirs[idx],
            info,
          }))
          .filter((_) => !!_.info)

        resolve({
          react: (
            <Grid span={1} className="codeflare--grid codeflare--mini">
              {details.map((_) => (
                <GridItem key={_.jobId}>
                  <Tile
                    className="codeflare--tile"
                    data-job-id={_.jobId}
                    data-run-dir={_.runDir}
                    data-status={_.info.status}
                    title={_.jobId.slice(0, _.jobId.indexOf("-"))}
                    onClick={onClick}
                  />
                </GridItem>
              ))}
            </Grid>
          ),
        })
      }
    })
  })
}
