/*
 * Copyright 2023 The Kubernetes Authors
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

import type { Arguments } from "@kui-shell/core"
import type { MadWizardOptions } from "madwizard"

import appName from "./appName"
import { ProfileOptions, profileFlags } from "./options"

export type LogsOptions = ProfileOptions & {
  l: string
  "label-selector": string
}

export const logsFlags = Object.assign({}, profileFlags, {
  alias: Object.assign({}, profileFlags.alias, {
    "label-selector": ["l"],
  }),
})

export default async function logs(args: Arguments<LogsOptions>) {
  // Display logs for this jobID; if not provided, the user will be
  // prompted (via the guidebook) to choose one
  const jobId = args.argvNoOptions[args.argvNoOptions.indexOf("logs") + 1]
  if (jobId) {
    process.env.JOB_ID = jobId
  }

  // query by label selector?
  const byLabelSelector = typeof args.parsedOptions.l === "string"
  if (byLabelSelector) {
    process.env.WAIT = "true"
    process.env.KUBE_POD_LABEL_SELECTOR = args.parsedOptions.l
  }

  // play this guidebook
  const guidebook = byLabelSelector
    ? "ml/ray/run/pod-stats"
    : jobId === undefined
    ? "ml/ray/aggregator"
    : "ml/ray/aggregator/with-jobid"

  // but only interactive starting here
  const ifor =
    jobId === undefined
      ? ["ml/ray/cluster/choose", "ml/ray/cluster/choose/kubernetes", "ml/ray/run/choose/list-jobs"]
      : undefined

  const options: MadWizardOptions = Object.assign({
    appName,
    store: args.parsedOptions.s || process.env.GUIDEBOOK_STORE,
    verbose: args.parsedOptions.V,
    profile: args.parsedOptions.profile || (await import("madwizard").then((_) => _.Profiles.lastUsed())),
    interactive: false,
    ifor,
  })

  const { guide } = await import("madwizard/dist/fe/cli")

  await guide([appName, "guide", guidebook], undefined, options)
  return true
}
