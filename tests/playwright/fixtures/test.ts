/* eslint-disable no-empty-pattern */
import { test as base, expect } from '@playwright/test'
import {
    BrowserContext,
    ElectronApplication,
    Page,
    _electron as electron,
} from 'playwright'
import log from 'node-color-log'

import { AxiosInstance } from 'axios'
import { apiUrl, isElectron, electronExecutablePath } from '../helpers/conf'
import { generateApiClient } from '../helpers/api/http-client'
import { APIKeyRequests } from '../helpers/api/api-keys'
import { DatabaseAPIRequests } from '../helpers/api/api-databases'
import { UserAgreementDialog } from '../pageObjects'

type CommonFixtures = {
    forEachTest: void
    api: {
        apiClient: AxiosInstance
        keyService: APIKeyRequests
        databaseService: DatabaseAPIRequests
    }
}

const commonTest = base.extend<CommonFixtures>({
    api: async ({ page }, use) => {
        const windowId = await page.evaluate(() => window.windowId)

        const apiClient = generateApiClient(apiUrl, windowId)
        const databaseService = new DatabaseAPIRequests(apiClient)
        const keyService = new APIKeyRequests(apiClient, databaseService)

        await use({ apiClient, keyService, databaseService })
    },
    forEachTest: [
        async ({ page }, use) => {
            // before each test:
            if (!isElectron) {
                await page.goto('/')
            } else {
                await page.locator('[data-testid="home-tab-databases"]').click()
            }

            const userAgreementDialog = new UserAgreementDialog(page)
            await userAgreementDialog.acceptLicenseTerms()

            const skipTourElement = page.locator('button', {
                hasText: 'Skip tour',
            })
            if (await skipTourElement.isVisible()) {
                skipTourElement.click()
            }

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
        await new Promise((resolve) => setTimeout(resolve, 2000))

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
