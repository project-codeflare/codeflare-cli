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

import type { KResponse, Registrar } from "@kui-shell/core"
import type TopOptions from "./controller/dashboard/top/options.js"
import type DashboardOptions from "./controller/dashboard/job/options.js"

import { flags } from "./controller/dashboard/options.js"
import { Options as DumpOptions, flags as dumpFlags } from "./controller/dump.js"

/** Register Kui Commands */
export default function registerCodeflareCommands(registrar: Registrar) {
  registrar.listen<KResponse, DashboardOptions>(
    `/codeflare/top/job`,
    (args) => import("./controller/dashboard/job/index.js").then((_) => _.default(args)),
    { flags }
  )

  registrar.listen<KResponse, TopOptions>(
    `/codeflare/top`,
    (args) => import("./controller/dashboard/top/index.js").then((_) => _.default(args)),
    { flags }
  )

  registrar.listen<KResponse, DumpOptions>(
    "/codeflare/dump",
    (args) => import("./controller/dump.js").then((_) => _.default(args)),
    { flags: dumpFlags }
  )
}
