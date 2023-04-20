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

import type TopOptions from "./options.js"
import type { Context, OnData, PodRec } from "../../../components/Top/types.js"

import { leastOf, stats } from "./stats.js"
import { parseCpu, parseMem, parseGpu } from "./parsers.js"
import defaultValueFor from "../../../components/Top/defaults.js"

/** Map from host to map from jobname to pods */
type Model = Record<string, Record<string, Record<string, PodRec>>>
//                  host            job            name

export default async function initWatcher(this: TopOptions, { context, cluster, namespace: ns }: Context, cb: OnData) {
  const debug = Debug("plugin-codeflare-dashboard/controller/top")
  debug("init watcher callbacks", context, cluster, ns)

  // To help us parse out one "record's" worth of output from kubectl
  const recordSeparator = "-----------"

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

  const me = process.env.USER || "NOUSER"

  debug("spawning watcher...")
  const { spawn } = await import("child_process")
  const child = spawn(
    "bash",
    [
      "-c",
      `"while true; do kubectl get pod --context ${context} ${
        ns ? `-n ${ns}` : ""
      } --no-headers -o=custom-columns=NAME:.metadata.name,JOB:'.metadata.labels.app\\.kubernetes\\.io/instance',HOST:.status.hostIP,CPU:'.spec.containers[0].resources.requests.cpu',CPUL:'.spec.containers[0].resources.limits.cpu',MEM:'.spec.containers[0].resources.requests.memory',MEML:'.spec.containers[0].resources.limits.memory',GPU:.spec.containers[0].resources.requests.'nvidia\\.com/gpu',GPUL:.spec.containers[0].resources.limits.'nvidia\\.com/gpu',JOB2:'.metadata.labels.appwrapper\\.mcad\\.ibm\\.com',CTIME:.metadata.creationTimestamp,USER:'.metadata.labels.app\\.kubernetes\\.io/owner'; echo '${recordSeparator}'; sleep 2; done"`,
    ],
    { shell: "/bin/bash", stdio: ["ignore", "pipe", "pipe"] }
  )
  debug("spawned watcher")

  const killit = () => child.kill()
  process.once("exit", killit)

  let message = ""
  child.stderr.on("data", (data) => {
    const msg = data.toString()
    if (message !== msg) {
      message += msg
    }
  })

  child.once("error", (err) => {
    console.error(err)
    process.off("exit", killit)
  })

  child.once("exit", (code) => {
    debug("watcher subprocess exiting", code)
    process.off("exit", killit)

    if (code !== 0 && message.length > 0) {
      cb({ context, cluster, namespace: ns, message })
    }
  })

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
        .filter((_) => !this.me || _.owner === me) // exclude pods not owned by me?
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
          name: this.redact ? `Job ${jobIdxFor(name)}` : name,
          jobIdx: jobIdxFor(name),
          pods: Object.values(byHost[host][name] || []),
        })),
      }))

      cb(Object.assign({ context, cluster, namespace: ns }, stats(hosts)))
    }
  })

  return child
}
