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

import { join } from "path"

type NameValue = { name: string; value: unknown }

function isNameValue(obj: object): obj is NameValue {
  const nv = obj as NameValue
  return typeof nv === "object" && typeof nv.name === "string" && typeof nv.value !== undefined
}

function isNameValueArray(obj: object): obj is NameValue[] {
  const nva = obj as NameValue[]
  return Array.isArray(nva) && nva.every(isNameValue)
}

function toRecord(nva: NameValue[]): Record<string, unknown> {
  return nva.reduce((R, { name, value }) => {
    R[name] = value
    return R
  }, {} as Record<string, unknown>)
}

async function getJobEnvFilepath(profile: string, jobId: string): Promise<string> {
  return join(await import("./path.js").then((_) => _.pathFor(profile, jobId)), "env.json")
}

export async function getJobEnv(profile: string, jobId: string): Promise<Record<string, unknown>> {
  const filepath = await getJobEnvFilepath(profile, jobId)
  const nameValueArray = JSON.parse(
    await import("fs/promises").then((_) => _.readFile(filepath)).then((_) => _.toString())
  )
  if (!isNameValueArray(nameValueArray)) {
    throw new Error("Malformatted env.json file")
  } else {
    return toRecord(nameValueArray)
  }
}

export async function numGpus(profile: string, jobId: string): Promise<number> {
  const filepath = await getJobEnvFilepath(profile, jobId)
  await import("./dashboard/tailf.js").then((_) => _.waitTillExists(filepath))

  try {
    const env = await getJobEnv(profile, jobId)

    const raw = env["NUM_GPUS"]
    return typeof raw === "number" ? raw : typeof raw === "string" ? parseInt(raw, 10) : 0
  } catch (err) {
    return 0
  }
}

export async function usesGpus(profile: string, jobId: string): Promise<boolean> {
  return (await numGpus(profile, jobId)) > 0
}
