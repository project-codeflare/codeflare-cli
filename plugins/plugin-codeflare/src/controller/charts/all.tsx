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

import React from "react"
import { Arguments, ReactResponse } from "@kui-shell/core"

export default async function all(args: Arguments) {
  const filepath = args.argvNoOptions[2]
  if (!filepath) {
    return `Usage chart all ${filepath}`
  }

  const charts = await Promise.all([
    args.REPL.qexec<ReactResponse>(`chart gpu "${filepath}/resources/gpu.txt"`),
    args.REPL.qexec<ReactResponse>(`chart vmstat "${filepath}/resources/pod-vmstat.txt"`),
  ])

  return {
    react: <div className="codeflare-chart-grid flex-fill">{charts.flatMap((_) => _.react)}</div>,
  }
}
