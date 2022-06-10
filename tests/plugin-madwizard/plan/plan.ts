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

import slash from "slash"
import { join, relative } from "path"

import { test, expect } from "@playwright/test"
import { Page, _electron as electron } from "playwright"

import { main } from "../../../package.json"
import { productName } from "../../../plugins/plugin-client-default/config.d/name.json"

import { Tree } from "./Input"

function githubActionsOS() {
  return process.env.RUNNER_OS
    .replace(/macOS/, "darwin")
    .replace(/Linux/, "linux")
    .replace(/Windows/, "win32")
}

function githubActionsArch() {
  return process.env.RUNNER_ARCH
    .replace(/X64/, 'x64')
    .replace(/ARM64/, 'arm64')
}

function electronProductionPath() {
  return process.platform === 'linux' ? productName
    : process.platform === 'win32' ? `${productName}.exe`
    : join(productName + ".app", "Contents/MacOS", productName)
}

async function startElectron() {
  // Launch Electron app; "shell" tells Kui to ignore the command line
  // and just launch a plain shell
  const executablePath = !process.env.EXECUTABLE_PATH ? undefined
    : process.env.EXECUTABLE_PATH !== "github-actions-production"
    ? process.env.EXECUTABLE_PATH
    : join(process.env.GITHUB_WORKSPACE,
           'dist/electron',
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

async function checkNode(page: Page, tree: Tree, containerSelector: string) {
  const nodeSelector = `${containerSelector} > .pf-c-tree-view__content > .pf-c-tree-view__node`
  await page.isVisible(nodeSelector)

  const nameSelector = ".pf-c-tree-view__node-text"
  const nameElement = await page.locator(`${nodeSelector} > .pf-c-tree-view__node-container > ${nameSelector}`)
  await nameElement.isVisible()

  await expect(nameElement).toHaveText(tree.name)
}

async function scanNode(page: Page, tree: Tree, containerSelector: string) {
  await checkNode(page, tree, containerSelector)

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  await scanNodes(page, tree.children, containerSelector)
}

async function scanNodes(page: Page, children: Tree[], containerSelector: string) {
  if (children) {
    for (let idx = 0; idx < children.length; idx++) {
      const subtree = children[idx]

      const listItemSelector = `${containerSelector} > ul > li:nth-child(${idx + 1})`
      const listItemElement = await page.locator(listItemSelector)
      await listItemElement.isVisible()

      const isExpanded = await listItemElement.getAttribute("aria-expanded")
      if (!isExpanded) {
        await listItemElement.scrollIntoViewIfNeeded()
        await listItemElement.click()
      }

      await scanNode(page, subtree, listItemSelector)

      if (!isExpanded) {
        await listItemElement.scrollIntoViewIfNeeded()
        await listItemElement.click()
      }
    }
  }
}

export default function doPlan(markdown: Input) {
  // on macos, sometimes things take a long time to start, try this
  test.setTimeout(120000)

  test(markdown.input, async () => {
    const { app, page } = await startElectron()

    // the path.relative is not needed, but we are using it to test
    // that relative paths work
    await page.keyboard.type(`plan -u ${slash(relative(process.cwd(), join(__dirname, "../markdowns", markdown.input)))}`)
    await page.keyboard.press("Enter")

    const tree = markdown.tree("guide")
    const treeSelector = ".kui--dependence-tree"

    await page.isVisible(treeSelector)
    await scanNodes(page, tree, treeSelector)

    await app.close()
  })
}
