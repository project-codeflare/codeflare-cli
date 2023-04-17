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
import type Options from "./options.js"

async function lastNJob(profile: string, N: number) {
  const [{ join }, { readdir, stat }, { Profiles }] = await Promise.all([
    import("path"),
    import("fs/promises"),
    import("madwizard"),
  ])

  const dir = Profiles.guidebookJobDataPath({ profile })
  const files = await readdir(dir)
  if (files.length === 0) {
    throw new Error("No jobs available")
    return
  }

  const cTimes = await Promise.all(files.map((_) => stat(join(dir, _)).then((_) => _.ctime.getTime())))
  const sorted = files.map((file, idx) => ({ file, lastM: cTimes[idx] })).sort((a, b) => b.lastM - a.lastM)

  if (!sorted[N]) {
    throw new Error("Specified historical job not available")
  } else {
    return sorted[N].file
  }
}

export default async function jobIdFrom(args: Arguments<Options>, cmd: string, offset = 2) {
  const profile = args.parsedOptions.p || (await import("madwizard").then((_) => _.Profiles.lastUsed()))

  const jobIdFromCommandLine = args.argvNoOptions[args.argvNoOptions.indexOf(cmd) + offset]
  const jobId = /^-\d+$/.test(jobIdFromCommandLine)
    ? await lastNJob(profile, -parseInt(jobIdFromCommandLine, 10))
    : jobIdFromCommandLine === undefined
    ? await lastNJob(profile, 0)
    : jobIdFromCommandLine

  return { jobId, profile }
}
