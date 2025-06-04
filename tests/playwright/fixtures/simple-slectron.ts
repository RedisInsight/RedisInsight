/* eslint-disable no-empty-pattern */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { test as base, ElectronApplication, Page } from '@playwright/test'
import { _electron as electron } from 'playwright'
import log from 'node-color-log'
import { ossStandaloneConfig } from '../helpers/conf'

// Define shared state for worker scope
type WorkerSharedState = {
    apiUrl: string
    dbConfig: typeof ossStandaloneConfig
    baseUrl: string
    electronApp: ElectronApplication
}

type ElectronFixture = {
    electronApp: ElectronApplication
    electronPage: Page
}

async function launchElectronApp(
    baseUrl: string,
): Promise<ElectronApplication> {
    const electronApp = await electron.launch({
        executablePath: baseUrl,
        args: ['index.html'],
        timeout: 60000,
    })
    // Capture Electron logs
    electronApp.on('console', (msg) => {
        log.info(`Electron Log: ${msg.type()} - ${msg.text()}`)
    })

    return electronApp
}

async function waitForWindowWithTitle(
    electronApp: ElectronApplication,

    maxWaitTime = 5000,
    interval = 200,
): Promise<Page | null> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
        const windows = await electronApp.windows()
        for (const window of windows) {
            try {
                const title = await window.title()

                if (title) {
                    log.info(`✅ Found window with title: "${title}"`)
                    return window
                }
            } catch (e) {
                log.info('❌ Window title not found')
            }
        }
        await new Promise((resolve) => setTimeout(resolve, interval))
    }

    log.error(`❌ Window not found within ${maxWaitTime / 1000}s!`)
    throw Error('❌ Window not found ')
}

async function waitForWindows(
    electronApp: ElectronApplication,
    maxWaitTime = 60000,
    interval = 2000,
) {
    let windows: Page[] = []
    let elapsedTime = 0
    while (windows.length === 0 && elapsedTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, interval))
        windows = await electronApp.windows()
        elapsedTime += interval
        log.info(`🔍 Checking for windows... (${elapsedTime / 1000}s elapsed)`)
    }
    return windows
}

export const test = base.extend<
    ElectronFixture,
    { workerState: WorkerSharedState }
>({
    workerState: [
        async ({}, use, testInfo) => {
            log.info(
                `🚀 Setting up worker state for worker ${testInfo.workerIndex}`,
            )
            const workerState: WorkerSharedState = {
                // @ts-expect-error
                apiUrl: testInfo.project.use.apiUrl,
                dbConfig: ossStandaloneConfig,
                baseUrl: testInfo.project.use.baseURL || '',
                electronApp: null as any,
            }

            await use(workerState)
        },
        { scope: 'worker' },
    ],

    electronApp: async ({ workerState }, use) => {
        log.info('🚀 Starting RedisInsight...')

        const electronApp = await launchElectronApp(workerState.baseUrl)
        workerState.electronApp = electronApp
        log.info('⏳ Waiting for window...')
        const windows = await waitForWindows(electronApp)

        if (windows.length === 0) {
            log.error('❌ No windows detected after 60s! Exiting.')
            await electronApp.close()
            return
        }

        log.info(`✅ Found ${windows.length} window(s)!`)
        await use(electronApp)
    },

    electronPage: async ({ electronApp }, use) => {
        const window = await waitForWindowWithTitle(electronApp)

        if (!window) {
            log.error('❌ No matching window detected! Stopping test.')
            await electronApp.close()
            return
        }

        await window.waitForLoadState('domcontentloaded')
        log.info(`🖥️ Window Title: ${await window.title()}`)
        await use(window)
    },
})

export { expect } from '@playwright/test'
