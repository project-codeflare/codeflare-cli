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

import { CreateWindowFunction } from "@kui-shell/core"

import windowOptions from "../../window"
import { bootIcon, shutDownIcon } from "../../icons"

/** Handler for redeploying the server-side log aggregator up a profile */
async function logAggregator(task: "deploy" | "undeploy", profile: string, createWindow: CreateWindowFunction) {
  createWindow(
    // re: -y, this means run in non-interactive mode (-y is short for --yes)
    ["codeflare", "gui", "guide", "-y", "--profile", profile, `ml/ray/aggregator/in-cluster/client-side/${task}`],
    windowOptions({ title: "Stopping Log Aggregator " + profile })
  )
}

export default function bootMenuItem(profile: string, createWindow: CreateWindowFunction) {
  return [
    { label: "Start Log Aggregator", icon: bootIcon, click: () => logAggregator("deploy", profile, createWindow) },
    { label: "Stop Log Aggregator", icon: shutDownIcon, click: () => logAggregator("undeploy", profile, createWindow) },
  ]
}
