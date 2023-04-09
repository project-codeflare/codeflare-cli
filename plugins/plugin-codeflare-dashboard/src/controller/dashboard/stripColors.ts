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

/** Strip any color coding from `line`, but leave 33 (yellow) as this is used for worker id prefix */
export default function stripColors(line: string): string {
  // eslint-disable-next-line no-control-regex
  return line.replace(/(\x1b\[)([^m]+)m/g, (_, p1, p2) => p1 + p2.replace(/3[12456]/g, "") + "m")
}
