import { _electron as electron } from "playwright"
import { join } from "path"
import { main } from "../../package.json"
import { productName } from "../../plugins/plugin-client-default/config.d/name.json"

function githubActionsOS() {
  return process.env.RUNNER_OS.replace(/macOS/, "darwin")
    .replace(/Linux/, "linux")
    .replace(/Windows/, "win32")
}

function githubActionsArch() {
  return process.env.RUNNER_ARCH.replace(/X64/, "x64").replace(/ARM64/, "arm64")
}

function electronProductionPath() {
  return process.platform === "linux"
    ? productName
    : process.platform === "win32"
    ? `${productName}.exe`
    : join(productName + ".app", "Contents/MacOS", productName)
}

export default async function startElectron() {
  // Launch Electron app; "shell" tells Kui to ignore the command line
  // and just launch a plain shell
  const executablePath = !process.env.EXECUTABLE_PATH
    ? undefined
    : process.env.EXECUTABLE_PATH !== "github-actions-production"
    ? process.env.EXECUTABLE_PATH
    : join(
        process.env.GITHUB_WORKSPACE,
        "dist/electron",
        `${productName}-${githubActionsOS()}-${githubActionsArch()}`,
        electronProductionPath()
      )

  const app = await electron.launch({ args: [main, "shell"], executablePath })

  const page = await (await app).firstWindow()

  // clear localStorage
  await page.evaluate(() => {
    return localStorage.removeItem("debug")
  })

  await page.click(".repl-block.repl-active .repl-input-element")

  return { app, page }
}
