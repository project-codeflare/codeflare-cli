import { Arguments, KResponse, Registrar } from "@kui-shell/core"
import { SummaryResponse } from "../lib/util"

async function description(args: Arguments) {
  const filepath = args.argvNoOptions[1]
  if (!filepath) {
    throw new Error("Usage: codeflare description <filepath>")
  }

  const summaryCmd = await args.REPL.qexec<KResponse & SummaryResponse>(`cat ${filepath}`)
  const { KUBE_NS, WORKER_MEMORY, NUM_GPUS, MIN_WORKERS, MAX_WORKERS, RAY_IMAGE } = summaryCmd.runtimeEnv.env_vars

  const summaryData = {
    appClass: { label: "Application Class", value: "Unknown" },
    appName: { label: "Application Name", value: "Unknown" },
    language: { label: "Source Language", value: summaryCmd.language },
    pythonVersion: { label: "Python Version", value: "Unknown" },
    rayVersion: { label: "Ray Version", value: RAY_IMAGE },
    gpuClass: { label: "GPU Class", value: KUBE_NS },
    workerGPUs: { label: "GPUs per Worker", value: NUM_GPUS },
    workerMemory: { label: "Memory per Worker", value: WORKER_MEMORY },
    workerCount: { label: "Worker Count", value: `${MIN_WORKERS}-${MAX_WORKERS}` },
    status: { label: "Status", value: "Unknown" },
    parameters: { label: "Parameters", value: "Unknown" },
    dataSources: { label: "Data Sources", value: "Unknown" },
  }

  const React = await import("react")
  const Description = await import("../components/Description")

  return {
    react: React.createElement(Description.default, { summaryData }),
  }
}

export default function registerDescriptionCommands(registrar: Registrar) {
  registrar.listen("/description", description, { needsUI: true, outputOnly: true })
}
