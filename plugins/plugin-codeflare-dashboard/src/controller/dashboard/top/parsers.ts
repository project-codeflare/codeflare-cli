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

import defaultValueFor from "../../../components/Top/defaults.js"

/** @return as milli cpus, or -1 if not specified */
export function parseCpu(amount: string): number {
  try {
    if (amount === "<none>") {
      return -1
    } else if (amount[amount.length - 1] === "m") {
      return parseInt(amount.slice(0, amount.length - 1), 10)
    } else {
      return parseInt(amount, 10) * 1000
    }
  } catch (err) {
    console.error("Odd cpu spec " + amount)
    return defaultValueFor.cpu
  }
}

export const unit = {
  K: 1000,
  Ki: 1024,
  M: Math.pow(1000, 2),
  Mi: Math.pow(1024, 2),
  G: Math.pow(1000, 3),
  Gi: Math.pow(1024, 3),
  T: Math.pow(1000, 4),
  Ti: Math.pow(1024, 4),
  P: Math.pow(1000, 5),
  Pi: Math.pow(1024, 5),
  E: Math.pow(1000, 6),
  Ei: Math.pow(1024, 6),
}

type ValidUnit = keyof typeof unit

export function isValidUnit(u: string): u is ValidUnit {
  return unit[u as ValidUnit] !== undefined
}

/** @return as bytes, or -1 if not specified */
export function parseMem(amount: string): number {
  if (amount === "<none>") {
    return -1
  } else {
    const match = amount.match(/^(\d+)((k|M|G|T|P|E)?i?)$/)
    if (!match || (match[2] && !isValidUnit(match[2]))) {
      console.error("Odd memory spec " + amount)
      return -1
    } else {
      return parseInt(match[1], 10) * (!match[2] ? 1 : unit[match[2] as ValidUnit])
    }
  }
}

/** @return as count, or 0 if not specified */
export function parseGpu(amount: string): number {
  if (amount === "<none>") {
    return 0
  } else {
    return parseInt(amount, 10)
  }
}
