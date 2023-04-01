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

import { Arguments } from "@kui-shell/core"

import { pathsFor } from "./dashboard/tailf.js"
import { isValidKind } from "./dashboard/kinds.js"
import { Options as DashboardOptions, jobIdFrom, usage as dbUsage } from "./dashboard/index.js"

export type Options = DashboardOptions & {
  f: boolean
  follow: boolean
}

export const flags = {
  boolean: ["follow"],
  alias: { follow: ["f"] },
}

function usage() {
  return dbUsage("dump") + " [-f/--follow]"
}

/** Dump raw info, rather than nicely formatted into a dashboard */
export default async function dump(args: Arguments<Options>) {
  // what kind of data are we being asked to show
  const kind = args.argvNoOptions[args.argvNoOptions.indexOf("dump") + 1]

  // and for which jobId and profile?
  const { jobId, profile } = await jobIdFrom(args, "dump")

  if (!(isValidKind(kind) || kind === "path" || kind === "env")) {
    throw new Error(usage())
  } else if (!jobId) {
    throw new Error(usage())
  }

  if (kind === "path") {
    // print the path to the data captured for the given jobId in the given profile
    return import("./path.js").then((_) => _.pathFor(profile, jobId))
  } else if (kind === "env") {
    // print job env vars
    return JSON.stringify(await import("./env.js").then((_) => _.getJobEnv(profile, jobId)), undefined, 2)
  } else if (!args.parsedOptions.f) {
    const { createReadStream } = await import("fs")
    await Promise.all(
      (
        await pathsFor(kind, profile, jobId)
      ).map(
        (filepath) =>
          new Promise((resolve, reject) => {
            try {
              const rs = createReadStream(filepath)
              rs.on("close", resolve)
              rs.pipe(process.stdout)
            } catch (err) {
              reject(err)
            }
          })
      )
    )
  } else {
    const once = async () => {
      const tails = await import("./dashboard/tailf.js").then((_) => _.default(kind, profile, jobId, false))
      await Promise.all(tails.map((_) => _.then((_) => _.stream.pipe(process.stdout))))
      await Promise.all(tails.map((_) => new Promise((resolve) => _.then((_) => _.stream.on("close", resolve)))))
      return true
    }

    try {
      return once()
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      once()
    }
  }

  return true
}
