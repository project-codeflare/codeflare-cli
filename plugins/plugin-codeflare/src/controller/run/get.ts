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

import { readdir } from "fs"
import { Profiles } from "madwizard"
import { basename, join } from "path"
import prettyMilliseconds from "pretty-ms"
import { Arguments, Table } from "@kui-shell/core"
import { setTabReadonly } from "@kui-shell/plugin-madwizard"

import { productName } from "@kui-shell/client/config.d/name.json"

import { width, height } from "../dashboard"
import { getJobDefinition } from "../description"

async function openDashboard(this: Arguments["REPL"], /*evt: React.MouseEvent<HTMLDivElement>*/ runDir: string) {
  // const runDir = evt.currentTarget.getAttribute("data-run-dir")
  if (runDir) {
    const { ipcRenderer } = await import("electron")
    ipcRenderer.send(
      "synchronous-message",
      JSON.stringify({
        operation: "new-window",
        title: productName + " Dashboard: " + basename(runDir),
        initialTabTitle: "Dashboard",
        width,
        height,
        argv: ["codeflare", "dashboardui", runDir],
      })
    )
  }
}

function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1)
}

/** TODO: these are specific to Ray */
type Status = "SUCCEEDED" | "STOPPED" | "RUNNING" | "PENDING" | "ERROR"
function statusColor(status: Status) {
  switch (status) {
    case "SUCCEEDED":
      return "green-background"
    case "STOPPED":
    case "ERROR":
      return "red-background"
    case "RUNNING":
      return "blue-background"
    case "PENDING":
      return "yellow-background"
    default:
      return "gray-background"
  }
}

function formatDate(date: number): string {
  if (!date) {
    return "Running..."
  }
  return new Date(date).toLocaleString()
}

function getRunTime(start: number, end: number): string {
  const endTime = end || Date.now()
  return prettyMilliseconds(endTime - start, { secondsDecimalDigits: 0 })
}

export default async function getRuns(args: Arguments) {
  setTabReadonly(args)
  const profile = args.parsedOptions.p || args.parsedOptions.profile

  const onClick = openDashboard.bind(args.REPL)

  return new Promise<Table>((resolve, reject) => {
    const runsDir = Profiles.guidebookJobDataPath({ profile: profile ? profile.toString() : undefined })
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

        const table: Table = {
          defaultPresentation: "grid",
          body: details.map((_) => ({
            name: _.jobId,
            onclick: () => onClick(_.runDir),
            attributes: [
              { key: "STATUS", value: capitalize(_.info.status), tag: "badge", css: statusColor(_.info.status) },
              { key: "STARTED AT", value: formatDate(_.info.start_time) },
              { key: "FINISHED AT", value: formatDate(_.info.end_time) },
              { key: "RUN TIME", value: getRunTime(_.info.start_time, _.info.end_time) },
            ],
          })),
        }

        resolve(table)
        /* resolve({
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
        }) */
      }
    })
  })
}
