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
import { Mode, ReactProvider, Registrar } from "@kui-shell/core"

import Logs from "./components/Logs"
import Info from "./components/Info"

/** Register Kui Commands */
export default function registerCodeflareCommands(registrar: Registrar) {
  registrar.listen("/ray/job/logs", (args) => {
    const jobid = args.argvNoOptions[args.argvNoOptions.indexOf("logs") + 1]

    const logsMode: Mode & ReactProvider = {
      mode: "Logs",
      react: () => React.createElement(Logs, { jobid }),
    }

    return {
      metadata: {
        name: "Ray Logs",
        namespace: jobid,
      },
      modes: [logsMode],
    }
  })

  registrar.listen("/ray/job/info", (args) => {
    const jobid = args.argvNoOptions[args.argvNoOptions.indexOf("info") + 1]

    const infoMode: Mode & ReactProvider = {
      mode: "Job Info",
      react: () => React.createElement(Info, { jobid }),
    }

    return {
      metadata: {
        name: "Ray Job Info",
        namespace: jobid,
      },
      modes: [infoMode],
    }
  })
}
