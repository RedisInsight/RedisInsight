// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { connect } from 'puppeteer-real-browser'
import * as fs from 'fs';
import { exec } from 'child_process';
import { googleUser, googleUserPassword } from './conf';

// const stealthPlugin = StealthPlugin();
// stealthPlugin.enabledEvasions.delete('iframe.contentWindow');
// stealthPlugin.enabledEvasions.delete('navigator.plugins');
// puppeteer.use(stealthPlugin);

// Helper function for waiting
async function waitForTimeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export async function processGoogleSSOPuppeteer(urlToUse: string): Promise<void> {
    const { browser, page } = await connect({
        headless: false,
        args: [
            '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.119 Safari/537.36'
        ],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false
        // proxy:{
        //     host:'<proxy-host>',
        //     port:'<proxy-port>',
        //     username:'<proxy-username>',
        //     password:'<proxy-password>'
        // }
    
    })
    // const browser = await puppeteer.launch({
    //     headless: false,
    //     args: [
    //         '--disable-web-security',
    //         '--remote-allow-origins=*',
    //         '--allow-running-insecure-content',
    //         '--disable-client-side-phishing-detection',
    //         '--disable-dev-shm-usage',
    //         '--disable-gpu',
    //         '--disable-domain-reliability',
    //         '--disable-default-apps',
    //         '--no-default-browser-check',
    //         '--ignore-certificate-errors',
    //         '--incognito',
    //         '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    //     ],
    //     defaultViewport: null
    // });

    // const page = await browser.newPage();
    await page.setBypassCSP(true);
    fs.mkdirSync('./report/screenshots/', { recursive: true });

    const protocol = 'redisinsight://';
    const callbackUrl = 'cloud/oauth/callback';

    try {
        await page.goto(urlToUse);
        
        // Type email and submit
        await page.type('input[type="email"]', googleUser, { delay: Math.random() * 100 + 50 });
        await Promise.all([
            page.click('#identifierNext'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);

        // Wait for password field to be ready
        await page.waitForSelector('input[type="password"]', { visible: true });
        await waitForTimeout(500);

        // Type password and submit
        await page.type('input[type="password"]', googleUserPassword, { delay: Math.random() * 100 + 50 });
        const screenshotPass = await page.screenshot();
        fs.writeFileSync('./report/screenshots/puppeteer_screenshotPass.png', screenshotPass, 'base64');
        await Promise.all([
            page.click('#selectionc1'),
            fs.writeFileSync('./report/screenshots/puppeteer_screenshotPass1.png', await page.screenshot(), 'base64'),
            page.click('#passwordNext'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);
        await waitForTimeout(500);

        // Check for "Try another way" button
        const tryAnotherWayButtons = await page.$$("//*[text()='Try another way']");
        if (tryAnotherWayButtons.length > 0) {
            const buttonVisible = await tryAnotherWayButtons[0].isIntersectingViewport();
            if (buttonVisible) {
                await tryAnotherWayButtons[0].click();
            } else {
                console.log("'Try another way' button not found or not visible.");
            }
        }

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