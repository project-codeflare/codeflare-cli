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

import Debug from "debug"
import type { Arguments } from "@kui-shell/core"

import type Options from "./job/options.js"
import type { OnData, HostRec, PodRec, ResourceSpec, UpdatePayload } from "../../components/Top/types.js"

import { enterAltBufferMode } from "./term.js"
import defaultValueFor from "../../components/Top/defaults.js"

export type MyOptions = Options & {
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

/** @return as milli cpus, or -1 if not specified */
function parseCpu(amount: string): number {
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

const unit = {
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

function isValidUnit(u: string): u is ValidUnit {
  return unit[u as ValidUnit] !== undefined
}

/** @return as bytes, or -1 if not specified */
function parseMem(amount: string): number {
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
function parseGpu(amount: string): number {
  if (amount === "<none>") {
    return 0
  } else {
    return parseInt(amount, 10)
  }
}

function leastOf({ request, limit }: ResourceSpec, defaultValue: number): number {
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

/** Map from host to map from jobname to pods */
type Model = Record<string, Record<string, Record<string, PodRec>>>
//                  host            job            name

async function getCurrentCluster(): Promise<string> {
  const { execFile } = await import("child_process")
  return new Promise((resolve, reject) => {
    try {
      execFile("kubectl", ["config", "view", "--minify", "-o=jsonpath={.clusters[0].name}"], (err, stdout, stderr) => {
        if (err) {
          console.error(stderr)
          reject(err)
        } else {
          // trim off port
          resolve(stdout.replace(/:\d+$/, ""))
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

async function getCurrentNamespace(): Promise<string> {
  const { execFile } = await import("child_process")
  return new Promise((resolve, reject) => {
    try {
      execFile("kubectl", ["config", "view", "--minify", "-o=jsonpath={..namespace}"], (err, stdout, stderr) => {
        if (err) {
          console.error(stderr)
          reject(err)
        } else {
          resolve(stdout)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

async function getNamespaceFromArgsOrCurrent(args: Arguments<MyOptions>) {
  const namespace = args.parsedOptions.A ? "All Namespaces" : args.parsedOptions.n || (await getCurrentNamespace())
  const namespaceCommandLineOption = args.parsedOptions.A
    ? "--all-namespaces"
    : args.parsedOptions.n
    ? `-n ${args.parsedOptions.n}`
    : ""

  return { namespace, namespaceCommandLineOption }
}

export default async function jobsController(args: Arguments<MyOptions>) {
  const debug = Debug("plugin-codeflare-dashboard/controller/top")

  if (process.env.ALT !== "false") {
    enterAltBufferMode()
  }

  // To help us parse out one "record's" worth of output from kubectl
  const recordSeparator = "-----------"

  const [cluster, { namespace, namespaceCommandLineOption }] = await Promise.all([
    getCurrentCluster(),
    getNamespaceFromArgsOrCurrent(args),
  ])
  debug("cluster", cluster)
  debug("namespace", namespace || "using namespace from user current context")

  debug("spawning watcher...")
  const { spawn } = await import("child_process")
  const child = spawn(
    "bash",
    [
      "-c",
      `"while true; do kubectl get pod ${namespaceCommandLineOption} --no-headers -o=custom-columns=NAME:.metadata.name,JOB:'.metadata.labels.app\\.kubernetes\\.io/instance',HOST:.status.hostIP,CPU:'.spec.containers[0].resources.requests.cpu',CPUL:'.spec.containers[0].resources.limits.cpu',MEM:'.spec.containers[0].resources.requests.memory',MEML:'.spec.containers[0].resources.limits.memory',GPU:.spec.containers[0].resources.requests.'nvidia\\.com/gpu',GPUL:.spec.containers[0].resources.limits.'nvidia\\.com/gpu',JOB2:'.metadata.labels.appwrapper\\.mcad\\.ibm\\.com',CTIME:.metadata.creationTimestamp,USER:'.metadata.labels.app\\.kubernetes\\.io/owner'; echo '${recordSeparator}'; sleep 2; done"`,
    ],
    { shell: "/bin/bash", stdio: ["ignore", "pipe", "inherit"] }
  )
  debug("spawned watcher")

  const jobIndices: Record<string, number> = {} // lookup
  const jobOcc: (undefined | string)[] = [] // occupancy vector
  const jobIdxFor = (job: string): number => {
    const jobIdx = jobIndices[job]
    if (jobIdx !== undefined) {
      return jobIdx
    } else {
      for (let idx = 0; idx < jobOcc.length; idx++) {
        if (jobOcc[idx] === undefined) {
          jobOcc[idx] = job
          jobIndices[job] = idx
          return idx
        }
      }

      const jobIdx = jobOcc.push(job) - 1
      jobIndices[job] = jobIdx
      return jobIdx
    }
  }
  const removeJobIdx = (job: string) => {
    const jobIdx = jobIndices[job]
    if (jobIdx !== undefined) {
      delete jobIndices[job]
      jobOcc[jobIdx] = undefined
    }
  }

  const trim = (extantJobs: Record<string, boolean>) => {
    Object.keys(jobIndices)
      .filter((job) => !(job in extantJobs))
      .forEach(removeJobIdx)
  }

  const initWatcher = (cb: OnData) => {
    debug("init watcher callbacks")
    const me = process.env.USER || "NOUSER"

    child.on("error", (err) => console.error(err))

    let leftover = ""
    child.stdout.on("data", (data) => {
      const sofar = leftover + data.toString()

      const term = sofar.indexOf(recordSeparator)
      if (term < 0) {
        leftover = sofar
      } else if (term >= 0) {
        leftover = sofar.slice(term + recordSeparator.length)

        const lines = sofar.slice(0, term).split(/\n/).filter(Boolean)
        if (lines.length === 0) {
          return
        }

        const byHost: Model = lines
          .map((_) => _.split(/\s+/))
          .map((A) => ({
            name: A[0],
            job: A[1] === "<none>" ? A[9] : A[1],
            host: A[2],
            ctime: A[10] === "<none>" ? Date.now() : new Date(A[10]).getTime(),
            owner: A[11],
            cpu: { request: parseCpu(A[3]), limit: parseCpu(A[4]) },
            mem: { request: parseMem(A[5]), limit: parseMem(A[6]) },
            gpu: { request: parseGpu(A[7]), limit: parseGpu(A[8]) },
          }))
          .filter((_) => _.job && _.job !== "<none>") // exclude pods not associated with a job
          .filter((_) => !args.parsedOptions.me || _.owner === me) // exclude pods not owned by me?
          .map((rec) =>
            Object.assign(rec, {
              jobIdx: jobIdxFor(rec.job),
              tot: {
                cpu: leastOf(rec.cpu, defaultValueFor.cpu),
                mem: leastOf(rec.mem, defaultValueFor.mem),
                gpu: leastOf(rec.gpu, defaultValueFor.gpu),
              },
            })
          )
          .reduce((byHost, rec) => {
            // pod is not yet mapped to a host?
            if (rec.host !== "<none>") {
              if (!byHost[rec.host]) {
                byHost[rec.host] = {}
              }
              const byJob = byHost[rec.host]

              if (!byJob[rec.job]) {
                byJob[rec.job] = {}
              }
              const byName = byJob[rec.job]

              byName[rec.name] = rec
            }

            return byHost
          }, {} as Model)

        const extantJobs = Object.values(byHost)
          .flatMap((byJob) => Object.keys(byJob))
          .reduce((jobs, job) => {
            jobs[job] = true
            return jobs
          }, {} as Record<string, boolean>)
        trim(extantJobs)

        // turn the records of records into arrays to make the UI code
        // cleaner
        const hosts = Object.keys(byHost).map((host) => ({
          host,
          jobs: Object.keys(byHost[host] || []).map((name) => ({
            name: args.parsedOptions.redact ? `Job ${jobIdxFor(name)}` : name,
            jobIdx: jobIdxFor(name),
            pods: Object.values(byHost[host][name] || []),
          })),
        }))

        cb(Object.assign({ cluster, namespace }, stats(hosts)))
      }
    })
  }

  debug("loading UI dependencies")
  const [{ default: render }] = await Promise.all([import("../../components/Top/index.js")])

  debug("rendering")
  await render({ initWatcher })
  debug("exiting")
  return true
}

/** @return greatest common divisor of `a` and `b` */
//const gcd = (a: number, b: number): number => a ? gcd(b % a, a) : b
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
function stats(hosts: HostRec[]): Pick<UpdatePayload, "hosts" | "stats"> {
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
