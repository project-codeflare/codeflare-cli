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

type StatusThemeColor =
  | "gray"
  | "white"
  | "lightYellow"
  | "yellow"
  | "lightBlue"
  | "red"
  | "blue"
  | "magenta"
  | "lightGreen"
  | "green"

export type StatusTheme = Record<StatusThemeColor, TextProps>

export const defaultStatusTheme: StatusTheme = {
  gray: { color: "gray" },
  white: { color: "white", dimColor: true },
  lightYellow: { color: "yellow", dimColor: true },
  yellow: { color: "yellow" },
  lightBlue: { color: "blue" },
  red: { color: "red" },
  blue: { color: "cyan" },
  magenta: { color: "magenta" },
  lightGreen: { color: "green", dimColor: true },
  green: { color: "green" },
}

export const carbonStatusTheme: StatusTheme = {
  gray: { color: "#8d8d8d" }, // gray50
  white: { color: "#ff832b" }, // orange40
  lightYellow: { color: "#fddc69" }, // yellow20
  yellow: { color: "#8e6a00" }, // yellow60
  lightBlue: { color: "#82cfff" }, // cyan30
  red: { color: "#fa4d56" }, // red50
  blue: { color: "#0072c3" }, // cyan50
  magenta: { color: "#d4bbff" }, // purple30
  lightGreen: { color: "#6fdc8c" }, // green30
  green: { color: "#198038" }, // green60
}

export const patternflyStatusTheme: StatusTheme = {
  gray: { color: "#B8BBBE" }, // black-400
  white: { color: "#EC7A08" }, // orange-400
  lightYellow: { color: "#F9E0A2" }, // gold-100
  yellow: { color: "#C58C00" }, // gold-500
  lightBlue: { color: "#35CAED" }, // light-blue-300
  red: { color: "#C9190B" }, // red-100
  blue: { color: "#2B9AF3" }, // blue-300
  magenta: { color: "#A18FFF" }, // purple-300
  lightGreen: { color: "#C8EB79" }, // light-green-200
  green: { color: "#5BA352" }, // green-400
}

export const statusThemes = {
  user: defaultStatusTheme,
  carbon: carbonStatusTheme,
  patternfly: patternflyStatusTheme,
}

export type ValidTheme = keyof typeof statusThemes

export function isValidStatusTheme(theme: string): theme is ValidTheme {
  return Object.keys(statusThemes).includes(theme)
}
