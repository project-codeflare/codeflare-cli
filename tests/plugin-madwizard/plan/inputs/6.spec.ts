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

import doPlan from "../plan"
import Input from "../Input"

import importg from "./importg"
import importd from "./importd"

const filename = "guidebook-tree-model6.md"

const tree: Input["tree"] = () => [
  {
    name: "Sequence",
    children: [importg(), importd],
  },
]

const IN6: Input = {
  input: filename,
  tree,
}

doPlan(IN6)
