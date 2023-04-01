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
  { color: "#fdd49e" },
  { color: "#fdbb84" },
  { color: "#fc8d59" },
  { color: "#e34a33" },
  { color: "#b30000" },
]

export const purple: Theme = [
  { color: "#bfd3e6" },
  { color: "#9ebcda" },
  { color: "#8c96c6" },
  { color: "#8856a7" },
  { color: "#810f7c" },
]

export const magenta: Theme = [
  { color: "#fcc5c0" },
  { color: "#fa9fb5" },
  { color: "#f768a1" },
  { color: "#c51b8a" },
  { color: "#7a0177" },
]

export const green: Theme = [
  { color: "#d9f0a3" },
  { color: "#addd8e" },
  { color: "#78c679" },
  { color: "#31a354" },
  { color: "#006837" },
]

export const blue: Theme = [
  { color: "#d0d1e6" },
  { color: "#a6bddb" },
  { color: "#74a9cf" },
  { color: "#2b8cbe" },
  { color: "#045a8d" },
]

export const rain: Theme = [
  { color: "#d0d1e6" },
  { color: "#a6bddb" },
  { color: "#67a9cf" },
  { color: "#1c9099" },
  { color: "#016c59" },
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
