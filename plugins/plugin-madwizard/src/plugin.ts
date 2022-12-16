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

import { defaultGuidebook } from "@kui-shell/client/config.d/client.json"
import { Arguments, ParsedOptions, ReactResponse, Registrar, Tab } from "@kui-shell/core"

export type Options = ParsedOptions & {
  /** Alternate guidebook store */
  s: string

  /** Alternate guidebook store */
  store: string

  /** Run in UI mode */
  u: boolean

  /** verbose output */
  V: boolean

  /** verbose output */
  verbose: boolean

  /** do not load prior choices (the default "profile") */
  n: boolean

  /** Use this named profile */
  p: string

  /** Use this named profile */
  profile: string

  /** Absolute path to profiles directory */
  P: string

  /** Absolute path to profiles directory */
  "profiles-path": string

  /** Do not tee logs to the console */
  q: boolean

  /** Do not tee logs to the console */
  quiet: boolean

  /** Automatically accept all choices from the current profile */
  y: boolean

  /** Automatically accept all choices from the current profile */
  yes: boolean

  /** Interactive guide mode? [default: false] */
  i: boolean

  /** Interactive guide mode? [default: false] */
  interactive: boolean

  /** Interactive guide mode only for last question? [default: false] */
  z: boolean

  /** Interactive guide mode only for the given notebook? [default: false] */
  ifor: string

  /** Use team-focused assertions */
  team?: string

  /** */
  raw?: boolean

  /** */
  "raw-prefix"?: string
}

// TODO export this from madwizard
type Task = "profile" | "guide" | "plan"

/** Parameters to `doMadwizard` */
type Params = {
  /** What we should ask madwizard to do for us */
  task: Task

  /** UI mode only; should the Kui tab be placed into readonly mode? [default: true] */
  readonlyUI?: boolean

  /** TODO: Oof, I can't remember what this is for [default: true] */
  withFilepath?: boolean

  /** TODO */
  cb?: (filepath: string, tab: Tab) => Promise<true | ReactResponse["react"]>

  /** Inject environment variables into the madwizard run */
  envFn?: () => Record<string, string>

  /** Assert answers to certain questions */
  assertionsFn?: (options: Options) => Record<string, string>
}

/** Front end to the `madwizard` CLI api */
export function doMadwizard({ readonlyUI = true, task, withFilepath = true, cb, envFn, assertionsFn }: Params) {
  return async ({ tab, argvNoOptions, parsedOptions }: Arguments<Options>) => {
    if (withFilepath && !argvNoOptions[1]) {
      // TODO codeflare should not be in plugin-madwizard
      argvNoOptions.push(process.env.GUIDEBOOK || defaultGuidebook)
    }

    if (envFn) {
      // TODO add better env-injection support to madwizard!
      Object.entries(envFn()).forEach(([key, value]) => {
        process.env[key] = value
      })
    }

    if (!parsedOptions.u) {
      // CLI path
      const { guide: cli } = await import("madwizard/dist/fe/cli/index.js")

      if (parsedOptions.q) {
        // TODO add this to madwizard?
        process.env.QUIET_CONSOLE = "true"
      }

      // decide which profile to use
      const profile = parsedOptions.n
        ? undefined
        : parsedOptions.p ||
          parsedOptions.profile || // specified on command line
          (await import("madwizard").then((_) => _.Profiles.lastUsed())) || // last used profile
          "default" // the default, if no lastUsed is found!

      await cli(
        [
          "madwizard",
          task,
          ...argvNoOptions.slice(1),
          ...(parsedOptions.n ? ["--no-profile"] : []),
          ...(parsedOptions.i ? ["-i"] : []),
          ...(parsedOptions["--"] ? ["--", ...parsedOptions["--"]] : []),
        ],
        undefined,
        {
          profile,
          profilesPath: parsedOptions["profiles-path"] || parsedOptions.P,
          store: parsedOptions.s || process.env.GUIDEBOOK_STORE,
          verbose: parsedOptions.V,
          raw: parsedOptions.raw,
          rawPrefix: parsedOptions["raw-prefix"],
          ifor: parsedOptions.ifor, // interactive only for a given guidebook?
          interactive: parsedOptions.i || (!parsedOptions.ifor && !parsedOptions.y),
          assertions: assertionsFn ? assertionsFn(parsedOptions) : undefined,
        }
      )
      return true
    }

    // UI path
    if (readonlyUI) {
      const { setTabReadonly } = await import("./util")
      setTabReadonly({ tab })
    }
    if (cb) {
      return {
        react: await cb(argvNoOptions[1], tab),
      }
    } else {
      return true
    }
  }
}

export const flags = {
  boolean: ["u", "V", "n", "q", "i", "y", "z", "raw"],
  configuration: { "populate--": true },
  alias: {
    store: ["s"],
    quiet: ["q"],
    interactive: ["i"],
    yes: ["y"],
    profile: ["p"],
    "profiles-path": ["P"],
    verbose: ["V"],
    team: ["t"],
    raw: ["r"],
  },
}

/** Register Kui Commands */
export default function registerMadwizardCommands(registrar: Registrar) {
  registrar.listen("/profile", doMadwizard({ task: "profile", withFilepath: false }))

  registrar.listen(
    "/guide",
    doMadwizard({
      task: "guide",
      cb: (filepath, tab) => import("./components/PlanAndGuide").then((_) => _.planAndGuide(filepath, { tab })),
    }),
    { outputOnly: true, flags }
  )

  registrar.listen(
    "/wizard",
    doMadwizard({
      readonlyUI: false,
      task: "guide",
      cb: (filepath, tab) => import("./components/Guide").then((_) => _.guide(filepath, { tab })),
    }),
    { flags }
  )

  registrar.listen(
    "/plan",
    doMadwizard({
      readonlyUI: false,
      task: "plan",
      cb: (filepath) => import("./components/Plan").then((_) => _.plan(filepath)),
    }),
    { flags }
  )
}
