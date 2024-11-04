import { chromium, BrowserContext } from 'playwright';
import * as fs from 'fs';
import { exec } from 'child_process';
import { googleUser, googleUserPassword } from './conf';

export async function processGoogleSSOPlaywright(urlToUse: string): Promise<void> {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    const protocol = 'redisinsight://';
    const callbackUrl = 'cloud/oauth/callback';

    try {
        await page.goto(urlToUse);
        
        // Enter email
        await page.locator('input[type="email"]').fill(googleUser);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(Math.random() * 1000 + 500); // Small delay to simulate human interaction
        
        // Wait for and enter password
        await page.waitForSelector('input[type="password"]', { timeout: 10000 });
        await page.locator('input[type="password"]').fill(googleUserPassword);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(Math.random() * 1000 + 500);

        // Optional: Check for "Try another way" button and click if it exists
        const tryAnotherWayBtn = page.locator("text='Try another way'");
        if (await tryAnotherWayBtn.isVisible()) {
            await tryAnotherWayBtn.click();
        } else {
            console.log("'Try another way' button not found or not visible.");
        }

        // Wait for redirect and capture the URL with the success state
        await page.waitForURL('**#success', { timeout: 10000 });

        const currentUrl = page.url();
        const parts = currentUrl.split('?');
        const modifiedUrl = parts.length > 1 ? parts[1] : currentUrl;
        const redirectUrl = `${protocol + callbackUrl}?${modifiedUrl}`;

        // Open Redis Insight Electron app using deeplink
        if (process.platform === 'linux') {
            console.log('redirectUrl: ', redirectUrl);
            exec(`xdg-open "${redirectUrl}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error opening Redis Insight on Linux', error);
                    return;
                }
                console.log('Redis Insight opened successfully', stdout);
            });
        } else {
            const open = (await import('open')).default;
            await open(redirectUrl, { app: { name: 'Redis Insight' } });
        }
    } catch (error) {
        console.error('Error during Google SSO automation:', error);

        // Take a screenshot if there's an error
        fs.mkdirSync('./report/screenshots/', { recursive: true });
        await page.screenshot({ path: './report/screenshots/playwright_screenshot.png' });
        console.log('Screenshot saved as playwright_screenshot.png');
    } finally {
        await browser.close();
    }
}