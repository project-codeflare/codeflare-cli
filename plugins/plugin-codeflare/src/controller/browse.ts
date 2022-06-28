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

import { Arguments, Registrar } from "@kui-shell/core"

import "../../web/scss/components/Dashboard/s3.scss"

async function browseS3(args: Arguments) {
  await import("@kui-shell/plugin-s3").then((_) => _.enable())
  return args.REPL.qexec("ls /s3")
}

export default function registerBrowseCommands(registrar: Registrar) {
  registrar.listen("/browse/s3", browseS3, {
    needsUI: true,
    width: 1280,
    height: 960,
  })
}
