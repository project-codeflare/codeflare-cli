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

import type { Context, ChangeContextRequest } from "../components/Top/types.js"

export async function kubectl(argv: string[], kubectl = "kubectl", quiet = false): Promise<string> {
  const { execFile } = await import("child_process")
  return new Promise((resolve, reject) => {
    try {
      execFile(kubectl, argv, (err, stdout, stderr) => {
        if (err) {
          if (!quiet) {
            console.error(stderr)
          }
          reject(err)
        } else {
          // trim off port
          resolve(stdout)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

export async function getCurrentContext(): Promise<string> {
  return kubectl(["config", "current-context"]).then((_) => _.trim())
}

export async function getCurrentCluster(): Promise<string> {
  // minify limits the view output to show only the current context
  return kubectl(["config", "view", "--minify", "-o=jsonpath={.clusters[0].name}"])
}

export async function getCurrentNamespace(): Promise<string> {
  // minify limits the view output to show only the current context
  return kubectl(["config", "view", "--minify", "-o=jsonpath={..namespace}"])
}

export async function getCurrentClusterOfContext(context: string): Promise<string> {
  return kubectl([
    "config",
    "view",
    `-o=jsonpath={range .contexts[?(@.name=="${context}")]}{.context.cluster}{"\\n"}{end}`,
  ]).then((_) => _.split(/\n/)[0])
}

export async function getCurrentNamespaceOfContext(context: string): Promise<string> {
  return kubectl([
    "config",
    "view",
    `-o=jsonpath={range .contexts[?(@.name=="${context}")]}{.context.namespace}{"\\n"}{end}`,
  ]).then((_) => _.split(/\n/)[0])
}

/** @return a list of namespaces in the given context */
function listNamespaces(context: string): Promise<string[]> {
  return kubectl(["get", "ns", "-o=name", "--context", context], undefined, true)
    .catch(() => kubectl(["projects", "-q", "--context", context], "oc"))
    .then((raw) => raw.split(/\n/))
    .then((_) => _.map((ns) => ns.replace(/^namespace\//, "")))
}

/** @return a list of available contexts */
async function listContexts(): Promise<string[]> {
  return kubectl(["config", "get-contexts", "-o=name"]).then((_) => _.split(/\n/))
}

/** @return a list of available clusters */
/* async function listClusters(): Promise<string[]> {
  return kubectl(["config", "view", '-o=jsonpath={range .clusters[*]}{.name}{"\\n"}{end}']).then((_) => _.split(/\n/))
} */

/**
 * Use nodejs's remainder % to implement true modulo
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
 */
function mod(n: number, d: number) {
  return ((n % d) + d) % d
}

/**
 * Cycle through the next/prev option of cluster or namespace
 * @return the next/prev option to use
 */
export async function changeContext(req: ChangeContextRequest): Promise<Context | undefined> {
  const isNsSwitch = req.which === "namespace"

  const current = isNsSwitch ? req.context.namespace : req.context.context
  const options = isNsSwitch ? await listNamespaces(req.context.context) : await listContexts()

  const idx = options.indexOf(current)
  if (idx >= 0) {
    const newIdx = mod(idx + (req.dir === "up" ? -1 : 1), options.length - 1)
    const newOption = options[newIdx]

    const updatedContext = {
      context: isNsSwitch ? req.context.context : newOption,
      cluster: isNsSwitch ? req.context.cluster : await getCurrentClusterOfContext(newOption),
      namespace: isNsSwitch ? newOption : (await getCurrentNamespaceOfContext(newOption)) || "default",
    }

    if (updatedContext.namespace) {
      return updatedContext
    }
  }
}
