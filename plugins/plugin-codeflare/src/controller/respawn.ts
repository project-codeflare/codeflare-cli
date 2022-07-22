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

import { encodeComponent } from "@kui-shell/core"

/** Fill in the given command line to spawn ourselves as a subprocess */
export default function respawnCommand(cmdline: string | string[]) {
  return {
    argv: [
      encodeComponent(process.argv[0]),
      encodeComponent(process.env.CODEFLARE_HEADLESS + "/codeflare.min.js"),
      "--",
      ...(typeof cmdline === "string" ? [cmdline] : cmdline),
    ],
    env: {
      KUI_S3: "false",
      KUI_HEADLESS: "true",
      KUI_HEADLESS_WEBPACK: "true",
      ELECTRON_RUN_AS_NODE: "true",
      GUIDEBOOK_STORE: process.env.GUIDEBOOK_STORE || "",
      DEBUG: process.env.DEBUG || "",
      HOME: process.env.HOME || "",
      PATH: process.env.PATH || "",
      KUBECONFIG: process.env.KUBECONFIG || "",
    },
  }
}
