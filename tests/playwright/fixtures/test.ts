/* eslint-disable no-empty-pattern */
import { test as base, expect } from '@playwright/test'
import type {
    Fixtures,
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions,
} from '@playwright/test'
import {
    BrowserContext,
    ElectronApplication,
    Page,
    _electron as electron,
} from 'playwright'
import log from 'node-color-log'

const isElectron = process.env.ELECTRON_EXECUTABLE_PATH !== undefined

base.beforeEach(async ({ page }) => {
    if (!isElectron) {
        await page.goto('/')
    }

    await page.waitForSelector('[aria-label="Main navigation"]', {
        timeout: 10000,
    })
})

type ElectronTestFixtures = {
    electronApp: ElectronApplication
    page: Page
    context: BrowserContext
}

export const electronFixtures: Fixtures<
    ElectronTestFixtures,
    {},
    PlaywrightTestArgs & PlaywrightTestOptions,
    PlaywrightWorkerArgs & PlaywrightWorkerOptions
> = {
    electronApp: async ({}, use) => {
        const electronApp = await electron.launch({
            executablePath: process.env.ELECTRON_EXECUTABLE_PATH,
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
        const page = await electronApp.firstWindow()

        await use(page)
    },
    context: async ({ electronApp }, use) => {
        const context = electronApp.context()

        await use(context)
    },
}

const electronTest = base.extend<ElectronTestFixtures>(electronFixtures)
const browserTest = base

const test = isElectron ? electronTest : browserTest

export { test, expect, isElectron }
