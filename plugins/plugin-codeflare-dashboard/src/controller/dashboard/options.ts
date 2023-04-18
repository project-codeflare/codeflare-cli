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

type Options = {
  /** Run in blinking lights mode */
  demo: boolean

  /** Scale up the grid? */
  scale: number

  /** Theme to use for worker status */
  theme: string

  /** Number of lines of events to show [default: 8] */
  events: number

  /** Number of lines of application logs to show [default: 1] */
  lines: number
}

export default Options

export const flags = {
  boolean: [
    // TODO these are top-specific
    "me",
    "redact",

    // generic?
    "demo",
  ],
  alias: {
    // TODO these are node-specific
    indices: ["i"],
    namespace: ["n"],
    "all-namespaces": ["A"],

    events: ["e"],
    lines: ["l"],
    theme: ["t"],
    demo: ["d"],
    scale: ["s"],
    "update-frequency": ["u"],
  },
}
