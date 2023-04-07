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
export const colorbrewer1: StatusTheme = [
  /*{ color: "#ffff99" },
  { color: "#fdbf6f" },
  { color: "#ff7f00" },
  { color: "#33a02c" },
  { color: "#a6cee3" },
  { color: "#b2182b" },*/

  /* pastel */
  /* { color: "#ffffb3" },
  { color: "#fdb462" },
  { color: "#bebada" },
  { color: "#8dd3c7" },
  { color: "#80b1d3" },
  { color: "#fb8072" }, */

  /* only works in dark terminals */
  /* { color: "#ffff33" },
  { color: "#ff7f00" },
  { color: "#984ea3" },
  { color: "#4daf4a" },
  { color: "#377eb8" },
  { color: "#e41a1c" }, */

  { color: "#" },
  { color: "#" },
  { color: "#" },
  { color: "#" },
  { color: "#" },
  { color: "#" },

  /*  { color: "#5e4fa2" },
  { color: "#3288bd" },
  { color: "#e6f598" },
  { color: "#66c2a5" },
  { color: "#d53e4f" },*/
]

/* pastel */
export const colorbrewer2: StatusTheme = [
  { color: "#ffffb3" },
  { color: "#fdb462" },
  { color: "#bebada" },
  { color: "#8dd3c7" },
  { color: "#80b1d3" },
  { color: "#fb8072" },
]

/* only works in dark terminals */
export const colorbrewer3: StatusTheme = [
  { color: "#ffff33" },
  { color: "#ff7f00" },
  { color: "#984ea3" },
  { color: "#4daf4a" },
  { color: "#377eb8" },
  { color: "#e41a1c" },
]

export const colorbrewer4: StatusTheme = [
  { color: "#ffff99" },
  { color: "#fdc086" },
  { color: "#beaed4" },
  { color: "#7fc97f" },
  { color: "#386cb0" },
  { color: "#f0027f" },
]

/* diverging scheme=Spectral */
export const colorbrewer5: StatusTheme = [
  { color: "#fc8d59" },
  { color: "#fee08b" },
  { color: "#e6f598" },
  { color: "#99d594" },
  { color: "#3288bd" },
  { color: "#d53e4f" },
]

/* diverging scheme=RdYlBu */
export const colorbrewer6: StatusTheme = [
  { color: "#fc8d59" },
  { color: "#fee090" },
  { color: "#e0f3f8" },
  { color: "#91bfdb" },
  { color: "#4575b4" },
  { color: "#d73027" },
]

/* diverging scheme=RdBu */
export const colorbrewer7: StatusTheme = [
  { color: "#ef8a62" },
  { color: "#fddbc7" },
  { color: "#d1e5f0" },
  { color: "#67a9cf" },
  { color: "#2166ac" },
  { color: "#b2182b" },
]

/*export const colorbrewer4: StatusTheme = [
  { color: "#" },
  { color: "#" },
  { color: "#" },
  { color: "#" },
  { color: "#" },
  { color: "#" },
]*/

export const statusThemes = {
  user,
  carbon,
  patternfly,
  colorbrewer1,
  colorbrewer2,
  colorbrewer3,
  colorbrewer4,
  colorbrewer5,
  colorbrewer6,
  colorbrewer7,
}

export type ValidTheme = keyof typeof statusThemes

export function isValidStatusTheme(theme: string): theme is ValidTheme {
  return Object.keys(statusThemes).includes(theme)
}
