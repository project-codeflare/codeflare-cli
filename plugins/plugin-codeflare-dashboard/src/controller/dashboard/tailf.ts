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

import Kind, { KindedSource, resourcePaths } from "./job/kinds.js"

export type Tail = {
  kind: Kind
  stream: import("stream").Readable
  quit: TailFile["quit"]
}

export function waitTillExists(filepath: string, okIf404 = true) {
  return new Promise<boolean>((resolve, reject) => {
    const watcher = chokidar.watch(filepath)

    const closeAndResolve = async (exists = true) => {
      await watcher.close()
      resolve(exists)
    }

    const closeAndReject = async (err: unknown) => {
      await watcher.close()
      reject(err)
    }

    watcher.on("add", closeAndResolve)
    watcher.on("error", closeAndReject)

    // oof, we need to give up, at some point
    if (!okIf404) {
      const timeoutSeconds = process.env.FILE_WAIT_TIMEOUT ? parseInt(process.env.FILE_WAIT_TIMEOUT, 10) : 5
      setTimeout(() => {
        closeAndReject(new Error(`Could not find ${filepath} after ${timeoutSeconds} seconds`))
      }, timeoutSeconds * 1000)
    }
  })
}

async function initTail({ kind, filepath }: KindedSource, split = true, okIf404 = true): Promise<null | Tail> {
  const exists = await waitTillExists(filepath, okIf404)

  if (!exists) {
    return null
  } else {
    return new Promise<Tail>((resolve, reject) => {
      const tail = new TailFile(filepath, {
        startPos: 0,
        pollFileIntervalMs: 500,
      })

      tail.once("tail_error", reject)
      tail.start()

      resolve({
        kind,
        stream: split ? tail.pipe(split2()) : tail,
        quit: tail.quit.bind(tail),
      })
    })
  }
}

export async function pathsFor(mkind: Kind, profile: string, jobId: string) {
  const { Profiles } = await import("madwizard")
  return resourcePaths[mkind].map((src) => {
    const kind = typeof src === "string" ? mkind : src.kind
    const resourcePath = typeof src === "string" ? src : src.filepath
    return {
      kind,
      filepath: join(Profiles.guidebookJobDataPath({ profile }), jobId, resourcePath),
    }
  })
}

export default async function tailf(
  kind: Kind,
  profile: string,
  jobId: string,
  split = true,
  okIf404 = true
): Promise<Promise<null | Tail>[]> {
  const paths = await pathsFor(kind, profile, jobId)
  return paths.map((src) => initTail(src, split, okIf404))
}
