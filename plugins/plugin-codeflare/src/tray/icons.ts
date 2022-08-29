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

/** Icon set for the tray menu items */

import ray from "@kui-shell/client/icons/png/rayTemplate.png"
import profile from "@kui-shell/client/icons/png/profileTemplate.png"
import bug from "@kui-shell/client/icons/png/bugTemplate.png"
import powerOff from "@kui-shell/client/icons/png/powerOffTemplate.png"
import play from "@kui-shell/client/icons/png/playTemplate.png"
import grid from "@kui-shell/client/icons/png/gridTemplate.png"
import gettingStarted from "@kui-shell/client/icons/png/gettingStartedTemplate.png"

import { join } from "path"

function resources() {
  return process.platform === "darwin" ? join(process.argv0, "../../Resources") : join(process.argv0, "../resources")
}

export function iconHome() {
  return process.env.CODEFLARE_HEADLESS || join(resources(), "app/dist/headless")
}

/** Resize and templatize, so that the icon morphs with platform color themes */
function iconFor(filepath: string) {
  return join(iconHome(), filepath)
}

export const rayIcon = iconFor(ray)
export const profileIcon = iconFor(profile)
export const bugIcon = iconFor(bug)
export const powerOffIcon = iconFor(powerOff)
export const bootIcon = iconFor(play)
export const shutDownIcon = iconFor(powerOff)
export const gridIcon = iconFor(grid)
export const gettingStartedIcon = iconFor(gettingStarted)
