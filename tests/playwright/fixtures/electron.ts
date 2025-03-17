import { test as base, ElectronApplication, Page} from '@playwright/test'
import { _electron as electron} from 'playwright'
import {ossStandaloneConfig} from "../helpers/conf";
import {DatabaseAPIRequests} from "../helpers/api/api-databases";

type WorkerSharedState = {
    apiUrl: string;
    dbConfig: typeof ossStandaloneConfig;
    baseUrl: string;
}

type ElectronFixture = {
    electronApp: ElectronApplication;
    mainWindow: Page;
}
// /home/tsvetan-tsvetkov/Downloads/Redis-Insight-linux-x86_64.AppImage
// /home/tsvetan-tsvetkov/code/RedisInsight/tests/e2e/electronBuild/redisinsight
// /home/tsvetan-tsvetkov/code/RedisInsight/tests/e2e/electronBuild/resources/app.asar/dist/renderer/index.html'
export const test = base.extend<ElectronFixture,
    { forEachWorker: void; workerState: WorkerSharedState } >({
    workerState: [async ({}, use, testInfo) => {
        console.log(`🚀 Setting up worker state for worker ${testInfo.workerIndex}`)

        // Initialize worker-scoped data
        const workerState: WorkerSharedState = {
            apiUrl: testInfo.project.use.apiUrl,
            dbConfig: ossStandaloneConfig,
            baseUrl: testInfo.project.use.baseURL
        }
        console.log(`🏠 Base URL: ${workerState.baseUrl}`)
        console.log(`🌐 API URL: ${workerState.apiUrl}`)
        console.log(`🗄️ Database Config: ${JSON.stringify(workerState.dbConfig)}`)

        await use(workerState)

    }, { scope: 'worker' }],
    forEachWorker: [async ({ workerState }, use) => {
        const ti = base.info().workerIndex
        console.log(`BEFORE Starting test worker ${ti}`)

        // Set up the database before tests
        const dbApi = new DatabaseAPIRequests(workerState.apiUrl)
        await dbApi.addNewStandaloneDatabaseApi(workerState.dbConfig)

        await use() // Run the tests
        // Something failing here doesn't affect test execution result
        console.log(`Stopping test worker ${ti}`)

        // Cleanup after all tests in this worker

        // throw new Error("test worker error")
        await dbApi.deleteStandaloneDatabaseApi(workerState.dbConfig)

    }, { scope: 'worker', auto: true }],
    electronApp: async ({baseURL}, use) => {
        // Launch Electron App
        const electronApp = await electron.launch({
            executablePath: baseURL,
            args: ['index.html'] // Adjust the path to your Electron main entry file

        })

        // Evaluation expression in the Electron context.
        const appPath = await electronApp.evaluate(async ({ app }) =>
            // This runs in the main Electron process, parameter here is always
            // the result of the require('electron') in the main app script.
             app.getAppPath()
        )
        console.log(appPath)

        // Get the first window that the app opens, wait if necessary.
        const window = await electronApp.firstWindow()

        // Print the title.
        console.log(await window.title())
        // Capture a screenshot.
        await window.screenshot({ path: 'intro.png' })
        // Direct Electron console to Node terminal.
        window.on('console', console.log)



        try {
            await use(electronApp)
        } finally {
            await electronApp.close()
        }
    },

    mainWindow: async ({ electronApp }, use) => {
        // Get the first window of the Electron app
        const window = await electronApp.firstWindow()
        console.log('IN MAIN WINDOW')

        await use(window)
    },
})

export { expect } from '@playwright/test'
