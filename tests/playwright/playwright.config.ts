import {defineConfig, devices } from '@playwright/test'
import {Status} from 'allure-js-commons'
import * as os from 'node:os'

export type TestOptions = {
    apiUrl: string;
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
    testDir: './tests',
    /* Maximum time one test can run for. */
    timeout: 600 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [['line'], ['html'], [
        'allure-playwright',
        {
            resultsDir: 'allure-results',
            detail: true,
            suiteTitle: true,
            links: {
                issue: {
                    nameTemplate: 'Issue #%s',
                    urlTemplate: 'https://issues.example.com/%s',
                },
                tms: {
                    nameTemplate: 'TMS #%s',
                    urlTemplate: 'https://tms.example.com/%s',
                },
                jira: {
                    urlTemplate: (v: any) => `https://jira.example.com/browse/${v}`,
                },
            },
            categories: [
                {
                    name: 'foo',
                    messageRegex: 'bar',
                    traceRegex: 'baz',
                    matchedStatuses: [Status.FAILED, Status.BROKEN],
                },
            ],
            environmentInfo: {
                os_platform: os.platform(),
                os_release: os.release(),
                os_version: os.version(),
                node_version: process.version,
            },
        },
    ]],

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        testIdAttribute: 'data-testid',
        video: {
            mode: 'on',
            size: {width: 1920, height: 1080}
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'localChromium',
            testMatch: ['**.web.spec.ts'],
            use: {
                ...devices['Desktop Chrome'],
                baseURL: process.env.COMMON_URL || 'https://localhost:5540',
                apiUrl: process.env.API_URL || 'https://localhost:5540/api',
                headless: false,
                deviceScaleFactor: undefined,
                viewport: null,
                launchOptions:{
                    args: ['--start-maximized',
                        '--disable-component-extensions-with-background-pages',
                        '--disable-dev-shm-usage',
                        '--disable-blink-features=AutomationControlled',
                        '--ignore-certificate-errors'
                    ]}
            },
        },
        {
            name: 'localElectron',
            testMatch: ['**.electron.spec.ts'],
            use: {
                baseURL: '/home/tsvetan-tsvetkov/Downloads/Redis-Insight-linux-x86_64.AppImage',
                // baseURL: '/usr/bin/redisinsight',
                // apiUrl: process.env.API_URL || 'https://localhost:5540/api',
                apiUrl: 'https://localhost:5530/api',
                headless: false,

            },
        },

        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        //
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
})
