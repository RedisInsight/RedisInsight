/* eslint-disable no-empty-pattern */
import { test as base, expect } from '@playwright/test'
import {
    BrowserContext,
    ElectronApplication,
    Page,
    _electron as electron,
} from 'playwright'
import log from 'node-color-log'

import { isElectron, electronExecutablePath } from '../helpers/conf'

const commonTest = base.extend<{ forEachTest: void }>({
    forEachTest: [
        async ({ page }, use) => {
            // before each test:
            if (!isElectron) {
                await page.goto('/')
            }

            await page.waitForSelector('[aria-label="Main navigation"]', {
                timeout: 2000,
            })

            await use()

            // after each test:
        },
        { auto: true },
    ],
})

const electronTest = commonTest.extend<{
    electronApp: ElectronApplication | null
    page: Page
    context: BrowserContext
}>({
    electronApp: async ({}, use) => {
        const electronApp = await electron.launch({
            executablePath: electronExecutablePath,
            args: ['index.html'],
            timeout: 60000,
        })
        electronApp.on('console', (msg) => {
            log.info(`Electron Log: ${msg.type()} - ${msg.text()}`)
        })

        // Wait for window startup
        await new Promise((resolve) => setTimeout(resolve, 1000))

        await use(electronApp)

        log.info('Closing Electron app...')
        await electronApp.close()
    },
    page: async ({ electronApp }, use) => {
        if (!electronApp) {
            throw new Error('Electron app is not initialized')
        }

        const electronPage = await electronApp.firstWindow()

        await use(electronPage)
    },
    context: async ({ electronApp }, use) => {
        if (!electronApp) {
            throw new Error('Electron app is not initialized')
        }

        const electronContext = electronApp.context()

        await use(electronContext)
    },
})

const test = isElectron ? electronTest : commonTest

export { test, expect, isElectron }
