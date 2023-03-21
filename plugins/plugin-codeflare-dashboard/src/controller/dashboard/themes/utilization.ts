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

/** @see https://colorbrewer2.org/#type=sequential&scheme=OrRd&n=6 */

import type { TextProps } from "ink"

export type Theme = [TextProps, TextProps, TextProps, TextProps, TextProps]

export const red: Theme = [
  { color: "#b30000" },
  { color: "#e34a33" },
  { color: "#fc8d59" },
  { color: "#fdbb84" },
  { color: "#fdd49e" },
]

export const purple: Theme = [
  { color: "#810f7c" },
  { color: "#8856a7" },
  { color: "#8c96c6" },
  { color: "#9ebcda" },
  { color: "#bfd3e6" },
]

/*
export const magenta: Theme = [
  { color: "#" },
  { color: "#" },
  { color: "#" },
  { color: "#" },
  { color: "#" },
]
*/

export const magenta: Theme = [
  { color: "#7a0177" },
  { color: "#c51b8a" },
  { color: "#f768a1" },
  { color: "#fa9fb5" },
  { color: "#fcc5c0" },
]

export const green: Theme = [
  { color: "#006837" },
  { color: "#31a354" },
  { color: "#78c679" },
  { color: "#addd8e" },
  { color: "#d9f0a3" },
]

export const blue: Theme = [
  { color: "#045a8d" },
  { color: "#2b8cbe" },
  { color: "#74a9cf" },
  { color: "#a6bddb" },
  { color: "#d0d1e6" },
]

export const rain: Theme = [
  { color: "#016c59" },
  { color: "#1c9099" },
  { color: "#67a9cf" },
  { color: "#a6bddb" },
  { color: "#d0d1e6" },
]

export const themes = {
  red,
  purple,
  magenta,
  blue,
  green,
  rain,
}

export type ValidTheme = keyof typeof themes

export function isValidTheme(theme: string): theme is ValidTheme {
  return Object.keys(themes).includes(theme)
}
