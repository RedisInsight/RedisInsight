import { connect } from 'puppeteer-real-browser'
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { googleUser, googleUserPassword, samlUser, samlUserPassword } from './conf';


// Helper function for waiting
async function waitForTimeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export async function processGoogleSSOPuppeteerReal(urlToUse: string): Promise<void> {
    const userDataDir = path.resolve(__dirname, '../test-data/Default');
    console.log('user data dir: ', userDataDir);
    const { browser, page } = await connect({
        headless: false,
        args: [
            // '--disable-web-security',
            // '--allow-running-insecure-content',
            // '--disable-features=IsolateOrigins,site-per-process',
            // '--ignore-certificate-errors',
            // `--user-data-dir=${userDataDir}`,
            // '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.119 Safari/537.36'
        ],
        customConfig: {
            userDataDir: userDataDir
        },
        turnstile: true,
        connectOption: {},
        disableXvfb: true,
        ignoreAllFlags: false,
    })

    // await page.setBypassCSP(true);
    fs.mkdirSync('./report/screenshots/', { recursive: true });

    const protocol = 'redisinsight://';
    const callbackUrl = 'cloud/oauth/callback';

    try {
        await page.goto(urlToUse);
        await waitForTimeout(7000);
        
        // Type email and submit
        await page.type('input[autocomplete="username"]', samlUser, { delay: Math.random() * 100 + 50 });

        // Type password and submit
        await page.type('input[autocomplete="current-password"]', samlUserPassword, { delay: Math.random() * 100 + 50 });
        const screenshotPass = await page.screenshot();
        fs.writeFileSync('./report/screenshots/puppeteer_screenshotPass.png', screenshotPass, 'base64');
        await page.click('input[type="submit"]');
        await waitForTimeout(5000);

        // Wait for the authorization to complete
        await page.waitForFunction(() => window.location.href.includes('#success'), { timeout: 10000 });

        const currentUrl = page.url();
        const parts = currentUrl.split('?');
        const modifiedUrl = parts.length > 1 ? parts[1] : currentUrl;
        const redirectUrl = `${protocol}${callbackUrl}?${modifiedUrl}`;

        // Open Redis Insight electron app using deeplink
        if (process.platform === 'linux') {
            console.log('redirectUrl: ', redirectUrl);
            exec(`xdg-open "${redirectUrl}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error opening Redis Insight on Linux:', error);
                    return;
                }
                console.log('Redis Insight opened successfully:', stdout);
            });
        } else {
            const open = (await import('open')).default;
            await open(redirectUrl, { app: { name: 'Redis Insight' } });
        }
    } catch (error) {
        console.error('Error during Google SSO automation:', error);

        // Take a screenshot if there's an error
        const screenshot = await page.screenshot();
        fs.writeFileSync('./report/screenshots/puppeteer_screenshot.png', screenshot, 'base64');
        console.log('Screenshot saved as puppeteer_screenshot.png');
    } finally {
        await browser.close();
    }
}