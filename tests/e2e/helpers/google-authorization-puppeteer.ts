import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
import { exec } from 'child_process';
import { googleUser, googleUserPassword } from './conf';

puppeteer.use(StealthPlugin());

export async function processGoogleSSOPuppeteer(urlToUse: string): Promise<void> {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--disable-web-security',
            '--remote-allow-origins=*',
            '--allow-running-insecure-content',
            '--disable-client-side-phishing-detection',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-domain-reliability',
            '--disable-default-apps',
            '--no-default-browser-check',
            '--disable-extensions',
            '--disable-popup-blocking',
            '--ignore-certificate-errors',
            '--incognito'
        ],
    });

    const page = await browser.newPage();

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

        // Type password and submit
        await page.type('input[type="password"]', googleUserPassword, { delay: Math.random() * 100 + 50 });
        await Promise.all([
            page.click('#passwordNext'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);

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
        await page.waitForURL('**/#success', { timeout: 10000 });

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

        fs.mkdirSync('./report/screenshots/', { recursive: true });
        // Take a screenshot if there's an error
        const screenshot = await page.screenshot();
        fs.writeFileSync('./report/screenshots/puppeteer_screenshot.png', screenshot, 'base64');
        console.log('Screenshot saved as puppeteer_screenshot.png');
    } finally {
        await browser.close();
    }
}