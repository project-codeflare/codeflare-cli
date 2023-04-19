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

import Debug from "debug"

import type { Arguments } from "@kui-shell/core"
import type TopOptions from "./options.js"

import { enterAltBufferMode } from "../term.js"
import { getCurrentContext, getCurrentCluster, getCurrentNamespace, changeContext } from "../../kubernetes.js"

import initWatcher from "./watcher.js"
import render from "../../../components/Top/index.js"

export async function getNamespaceFromArgsOrCurrent(args: Arguments<TopOptions>) {
  return /*args.parsedOptions.A ? "All Namespaces" :*/ args.parsedOptions.n || (await getCurrentNamespace())
}

export default async function jobsController(args: Arguments<TopOptions>) {
  const debug = Debug("plugin-codeflare-dashboard/controller/top")

  if (process.env.ALT !== "false") {
    enterAltBufferMode()
  }

  // these will be the initial values of cluster and namespace focus
  const [context, cluster, ns] = await Promise.all([
    getCurrentContext(),
    getCurrentCluster(),
    getNamespaceFromArgsOrCurrent(args),
  ])
  debug("context", context)
  debug("cluster", cluster)
  debug("namespace", ns || "using namespace from user current context")

  debug("rendering")
  await render({
    context,
    cluster,
    namespace: ns,
    initWatcher: initWatcher.bind(args.parsedOptions),
    changeContext,
  })
  debug("exiting")
  return true
}
