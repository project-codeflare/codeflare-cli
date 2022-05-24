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

import { join } from "path"

import { test, expect } from "@playwright/test"
import { Page, _electron as electron } from "playwright"
import { ElectronApplication } from "playwright-core"

import { main } from "../../../package.json"

import { Tree } from "./Input"

let app: ElectronApplication

async function startElectron() {
  // Launch Electron app.
  if (!app) {
    app = electron.launch({ args: [main] })
  }

  const page = await (await app).firstWindow()

  // clear localStorage
  await page.evaluate(() => {
    return localStorage.removeItem("debug")
  })

  await page.click(".repl-block.repl-active .repl-input-element")

  return page
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
  test(markdown.input, async () => {
    const page = await startElectron()

    await page.keyboard.type(`plan ${join(__dirname, "../markdowns", markdown.input)}`)
    await page.keyboard.press("Enter")

    const tree = markdown.tree("guide")
    const treeSelector = ".kui--dependence-tree"

    await page.isVisible(treeSelector)
    await scanNodes(page, tree, treeSelector)

    await page.reload()
  })
}
