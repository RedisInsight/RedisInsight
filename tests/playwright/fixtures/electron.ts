import { test as base, ElectronApplication, Page} from '@playwright/test'
import { _electron as electron } from 'playwright'
import {DatabaseAPIRequests} from "../helpers/api/api-databases";

type ElectronFixtures = {
    electronApp: ElectronApplication;
    mainWindow: Page;
}
// /home/tsvetan-tsvetkov/code/RedisInsight/tests/e2e/electronBuild/redisinsight
// /home/tsvetan-tsvetkov/code/RedisInsight/tests/e2e/electronBuild/resources/app.asar/dist/renderer/index.html'
export const test = base.extend<ElectronFixtures>({

    electronApp: async ({}, use) => {
        // Launch Electron App
        const electronApp = await electron.launch({
            executablePath: '/home/tsvetan-tsvetkov/code/RedisInsight/tests/e2e/electronBuild/redisinsight',
            args: ['index.html'], // Adjust the path to your Electron main entry file
        })

        // Evaluation expression in the Electron context.
        const appPath = await electronApp.evaluate(async ({ app }) => {
            // This runs in the main Electron process, parameter here is always
            // the result of the require('electron') in the main app script.
            return app.getAppPath();
        });
        console.log(appPath);

        // Get the first window that the app opens, wait if necessary.
        const window = await electronApp.firstWindow();
        // Print the title.
        console.log(await window.title());
        // Capture a screenshot.
        await window.screenshot({ path: 'intro.png' });
        // Direct Electron console to Node terminal.
        window.on('console', console.log);


        try {
            await use(electronApp)
        } finally {
            await electronApp.close()
        }
    },

    mainWindow: async ({ electronApp }, use) => {
        // Get the first window of the Electron app
        const window = await electronApp.firstWindow()
        await use(window)
    },
})

export { expect } from '@playwright/test'
