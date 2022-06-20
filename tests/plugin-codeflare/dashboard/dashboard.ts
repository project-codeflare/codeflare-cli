import slash from "slash"
import { join, relative } from "path"
import { test, expect } from "@playwright/test"

import startElectron from "../../common/startElectron"

export default function doDashboard(directory: string) {
  test.slow()
  test(`codeflare dashboard -f ${directory}`, async () => {
    const { app, page } = await startElectron()

    await page.keyboard.type(`dashboard -f ${slash(relative(process.cwd(), join(__dirname, "./inputs", directory)))}`)


    await page.keyboard.press("Enter")

    const splitSelector = ".kui--terminal-split-container"
    const splitElement = await page.locator(splitSelector)
    await expect(splitElement).toBeVisible()

    await app.close()
  })
}
