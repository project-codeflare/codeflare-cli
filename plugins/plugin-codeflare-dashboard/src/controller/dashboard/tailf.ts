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

import { join } from "path"
import split2 from "split2"
import chokidar from "chokidar"
import TailFile from "@logdna/tail-file"

import Kind, { resourcePaths } from "./kinds.js"

export type Tail = {
  stream: import("stream").Readable
  quit: TailFile["quit"]
}

export function waitTillExists(filepath: string) {
  const watcher = chokidar.watch(filepath)
  return new Promise<void>((resolve, reject) => {
    watcher.on("add", () => resolve())
    watcher.on("error", reject)
  })
}

async function initTail(filepath: string, split = true): Promise<Tail> {
  await waitTillExists(filepath)

  return new Promise<Tail>((resolve, reject) => {
    const tail = new TailFile(filepath, {
      startPos: 0,
      pollFileIntervalMs: 500,
    })

    tail.once("tail_error", reject)
    tail.start()

    resolve({
      stream: split ? tail.pipe(split2()) : tail,
      quit: tail.quit.bind(tail),
    })
  })
}

export async function pathsFor(kind: Kind, profile: string, jobId: string) {
  const { Profiles } = await import("madwizard")
  return resourcePaths[kind].map((resourcePath) =>
    join(Profiles.guidebookJobDataPath({ profile }), jobId, resourcePath)
  )
}

export default async function tailf(
  kind: Kind,
  profile: string,
  jobId: string,
  split = true
): Promise<Promise<Tail>[]> {
  return pathsFor(kind, profile, jobId).then((_) => _.map((filepath) => initTail(filepath, split)))
}
