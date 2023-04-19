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

import type { ChangeContextRequest } from "../components/Top/types.js"

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

export async function getCurrentCluster(): Promise<string> {
  return kubectl(["config", "view", "--minify", "-o=jsonpath={.clusters[0].name}"]).then((_) => _.replace(/:\d+$/, ""))
}

export async function getCurrentNamespace(): Promise<string> {
  return kubectl(["config", "view", "--minify", "-o=jsonpath={..namespace}"])
}

function listNamespaces(): Promise<string[]> {
  return kubectl(["get", "ns", "-o=name"], undefined, true)
    .catch(() => kubectl(["projects", "-q"], "oc"))
    .then((raw) => raw.split(/\n/))
    .then((_) => _.map((ns) => ns.replace(/^namespace\//, "")))
}

function mod(n: number, d: number) {
  return ((n % d) + d) % d
}

export async function changeContext(req: ChangeContextRequest) {
  if (req.which === "namespace") {
    const namespaces = await listNamespaces()
    const idx = namespaces.indexOf(req.from)
    if (idx >= 0) {
      const newIdx = mod(idx + (req.dir === "up" ? -1 : 1), namespaces.length - 1)
      return namespaces[newIdx]
    }
  }
}
