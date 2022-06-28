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

type LogRecord<T> = T & {
  hostname: string
  timestamp: number
}

export type HostMap<T, R extends LogRecord<T> = LogRecord<T>> = { [key: string]: R[] }

export function toHostMap<T, R extends LogRecord<T>>(records: R[]): HostMap<T, R> {
  return records.reduce((M, record) => {
    if (!M[record.hostname]) {
      M[record.hostname] = []
    }
    M[record.hostname].push(record)
    return M
  }, {} as HostMap<T, R>)
}

export default LogRecord
