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

import type { TextProps } from "ink"

export type StatusTheme = [TextProps, TextProps, TextProps, TextProps, TextProps, TextProps]

/** This uses the user's terminal colors */
export const user: StatusTheme = [
  { color: "gray" },
  { color: "magenta" },
  { color: "blue" },
  { color: "green", dimColor: true },
  { color: "green" },
  { color: "red" },
]

export const carbon: StatusTheme = [
  { color: "#8d8d8d" }, // gray50
  { color: "#d4bbff" }, // purple30
  { color: "#0072c3" }, // cyan50
  { color: "#6fdc8c" }, // green30
  { color: "#198038" }, // green60
  { color: "#fa4d56" }, // red50
]

export const patternfly: StatusTheme = [
  { color: "#B8BBBE" }, // black-400
  { color: "#A18FFF" }, // purple-300
  { color: "#2B9AF3" }, // blue-300
  { color: "#C8EB79" }, // light-green-200
  { color: "#5BA352" }, // green-400
  { color: "#C9190B" }, // red-100
]

/** https://colorbrewer2.org/#type=qualitative&scheme=Paired&n=8 */
export const colorbrewer: StatusTheme = [
  { color: "#fddbc7" },
  { color: "#ef8a62" },
  { color: "#d1e5f0" },
  { color: "#67a9cf" },
  { color: "#2166ac" },
  { color: "#b2182b" },
  /*  { color: "#5e4fa2" },
  { color: "#3288bd" },
  { color: "#e6f598" },
  { color: "#66c2a5" },
  { color: "#d53e4f" },*/
]

export const statusThemes = {
  user,
  carbon,
  patternfly,
  colorbrewer,
}

export type ValidTheme = keyof typeof statusThemes

export function isValidStatusTheme(theme: string): theme is ValidTheme {
  return Object.keys(statusThemes).includes(theme)
}
