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

import type Options from "../job/options.js"

type TopOptions = Options & {
  /** Don't show job names in the UI */
  redact: boolean

  /** Show just my jobs */
  m: boolean
  me: boolean

  /** Show jobs for one namespace */
  n: string
  namespace: string

  /** Show jobs across all namespaces */
  A: boolean
  "all-namespaces": boolean
}

export default TopOptions
