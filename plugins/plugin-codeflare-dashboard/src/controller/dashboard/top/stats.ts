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

import type { HostRec, ResourceSpec, UpdatePayload } from "../../../components/Top/types.js"

import { unit } from "./parsers.js"
import defaultValueFor from "../../../components/Top/defaults.js"

export function leastOf({ request, limit }: ResourceSpec, defaultValue: number): number {
  if (request === -1 && limit === -1) {
    return defaultValue
  } else if (request === -1) {
    return limit
  } else if (limit === -1) {
    return request
  } else {
    return Math.min(request, limit)
  }
}

/** @return greatest common divisor of `a` and `b` */
function gcd(a: number, b: number) {
  a = Math.abs(a)
  b = Math.abs(b)
  if (b > a) {
    const temp = a
    a = b
    b = temp
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (b == 0) return a
    a %= b
    if (a == 0) return b
    b %= a
  }
}

/** Extract min/total values for resource demand */
export function stats(hosts: HostRec[]): Pick<UpdatePayload, "hosts" | "stats"> {
  // find the min cpu, total cpu, etc.
  const stats = hosts
    .flatMap((_) => _.jobs.flatMap((_) => _.pods))
    .reduce(
      (stats, pod) => {
        const cpu = leastOf(pod.cpu, defaultValueFor.cpu)
        const mem = leastOf(pod.mem, defaultValueFor.mem)
        const gpu = leastOf(pod.gpu, defaultValueFor.gpu)

        stats.min.cpu = stats.min.cpu === Number.MAX_VALUE ? cpu : gcd(stats.min.cpu, cpu)
        //stats.min.mem = stats.min.mem === Number.MAX_VALUE ? mem / 1024 / 1024 : gcd(stats.min.mem, mem / 1024 / 1024)
        stats.min.mem = Math.min(stats.min.mem, mem)
        stats.min.gpu = Math.min(stats.min.gpu, gpu)

        stats.tot[pod.host].cpu += cpu
        stats.tot[pod.host].mem += mem
        stats.tot[pod.host].gpu += gpu

        return stats
      },
      {
        min: { cpu: Number.MAX_VALUE, mem: 32 * unit.Gi, gpu: Number.MAX_VALUE },
        tot: hosts.reduce((T, host) => {
          T[host.host] = { cpu: 0, mem: 0, gpu: 0 }
          return T
        }, {} as UpdatePayload["stats"]["tot"]),
      } as UpdatePayload["stats"]
    )

  return {
    hosts,
    stats,
  }
}
