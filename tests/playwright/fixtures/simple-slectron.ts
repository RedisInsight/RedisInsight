import { test as base, ElectronApplication, Page } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { ossStandaloneConfig } from '../helpers/conf';
import {updateControlNumber}   from "../helpers/electron/insights";
import {DatabaseHelper} from "../helpers/database";


// Define shared state for worker scope
type WorkerSharedState = {
    apiUrl: string;
    dbConfig: typeof ossStandaloneConfig;
    baseUrl: string;
    electronApp: ElectronApplication;
};

type ElectronFixture = {
    electronApp: ElectronApplication;
    electronPage: Page;
};

async function launchElectronApp(baseUrl: string): Promise<ElectronApplication> {
    const electronApp = await electron.launch({
        userDataDir: './ELECTRON-UDATA',
        executablePath: baseUrl,
        args: ['index.html'],
        timeout: 60000,
    });
    // Capture Electron logs
    electronApp.on('console', (msg) => {
        console.log(`Electron Log: ${msg.type()} - ${msg.text()}`);
    });

    return electronApp;
}

async function waitForWindows(electronApp: ElectronApplication, maxWaitTime = 60000, interval = 2000) {
    let windows = [];
    let elapsedTime = 0;
    while (windows.length === 0 && elapsedTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, interval));
        windows = await electronApp.windows();
        elapsedTime += interval;
        console.log(`🔍 Checking for windows... (${elapsedTime / 1000}s elapsed)`);
    }
    return windows;
}

export const test = base.extend<ElectronFixture, { workerState: WorkerSharedState }>({
    workerState: [
        async ({}, use, testInfo) => {
            console.log(`🚀 Setting up worker state for worker ${testInfo.workerIndex}`);
            const workerState: WorkerSharedState = {
                apiUrl: testInfo.project.use.apiUrl,
                dbConfig: ossStandaloneConfig,
                baseUrl: testInfo.project.use.baseURL,
                electronApp: null as any,
            };


            await use(workerState);
        },
        { scope: 'worker' },
    ],

    electronApp: async ({ workerState }, use) => {
        console.log('🚀 Starting RedisInsight...');

        // update control nmb
        // await updateControlNumber(48.2, workerState.apiUrl);

        let electronApp = await launchElectronApp(workerState.baseUrl);
        workerState.electronApp = electronApp;
        console.log('⏳ Waiting for window...');
        let windows = await waitForWindows(electronApp);

        if (windows.length === 0) {
            console.error('❌ No windows detected after 60s! Exiting.');
            await electronApp.close();
            return;
        }

        console.log(`✅ Found ${windows.length} window(s)!`);

        if (windows.length === 2) {
            console.log('⚠️ Detected two windows, closing all and restarting...');
            // await Promise.all(windows.map(win => win.close()));
            // await electronApp.close();
            //
            // console.log('🔄 Restarting RedisInsight...');
            // electronApp = await launchElectronApp(workerState.baseUrl);
            // workerState.electronApp = electronApp;
            //
            // windows = await waitForWindows(electronApp);
            // console.log(`🔍 Rechecking for windows... Found ${windows.length} window(s).`);
        }

        await use(electronApp);
    },

    electronPage: async ({ electronApp,workerState }, use) => {
        let windows = await waitForWindows(electronApp);

        if (windows.length === 0) {
            console.error('❌ No windows detected! Stopping test.');
            await electronApp.close();
            return;
        }
        if (windows.length === 2) {
            console.log('⚠️ Detected two windows, closing all and restarting...');
            // await Promise.all(windows.map(win => win.close()));
            // await electronApp.close();
            // console.log('🔄 Restarting RedisInsight...');
            // electronApp = await launchElectronApp(workerState.baseUrl);
            // workerState.electronApp = electronApp;
            // windows = await waitForWindows(electronApp);
            // console.log(`🔍 Rechecking for windows... Found ${windows.length} window(s).`);

            let titles = (await Promise.all(windows.map(async page => ({
                page,
                title: await page.title()  })))).find(entry => entry.title)?.page || null;

        }
        // if (windows.length === 2) {
        //     console.log('⚠️ Detected two windows, closing all and stopping test.');
        //     await Promise.all(windows.map(win => win.close()));
        //     await electronApp.close()
        //
        //     return;
        // }
        const window = windows[0];

        await window.waitForLoadState('domcontentloaded');
        console.log(`🖥️ Window Title: ${await window.title()}`);
        await use(window);
    },
});

export { expect } from '@playwright/test';
