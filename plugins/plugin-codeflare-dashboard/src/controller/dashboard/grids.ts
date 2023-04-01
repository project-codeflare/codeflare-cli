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

import type Kind from "./kinds.js"
import type { ValidTheme as ValidUtilizationTheme } from "./utilization/theme.js"

export type SupportedUtilizationGrid = "cpu%" | "mem%" | "gpu%" | "gpumem%"

export type SupportedGrid = "status" | SupportedUtilizationGrid

export const defaultUtilizationThemes: Record<SupportedUtilizationGrid, ValidUtilizationTheme> = {
  "cpu%": "rain",
  "mem%": "green",
  "gpu%": "purple",
  "gpumem%": "magenta",
}

export const providerFor: Record<SupportedUtilizationGrid, string> = {
  "cpu%": "CPU Utilization",
  "mem%": "Mem Utilization",
  "gpu%": "GPU Utilization",
  "gpumem%": "Mem Utilization",
}

export function isSupportedGrid(kind: Kind): kind is SupportedGrid {
  return kind === "status" || Object.keys(defaultUtilizationThemes).includes(kind)
}
