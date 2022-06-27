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

import { Registrar } from "@kui-shell/core"
import dashboard from "./controller/dashboard"
import charts from "./controller/charts"
import description from "./controller/description"

function help() {
  return `Usage:
codeflare [run] [<task>] [-s /path/to/store] [-u]
codeflare dashboard /path/to/logdir
codeflare chart gpu /path/to/logdir`
}

/** Register Kui Commands */
export default function registerCodeflareCommands(registrar: Registrar) {
  dashboard(registrar)
  charts(registrar)
  description(registrar)
  registrar.listen("/help", help)
}
