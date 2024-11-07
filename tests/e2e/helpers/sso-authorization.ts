import { connect } from 'puppeteer-real-browser'
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { samlUser, samlUserPassword } from './conf';
import { SsoAuthorizationPage } from '../pageObjects';
import { Common } from './common';

export class SsoAuthorization {
    /**
     * Process SSO authorization using Puppeteer
     * @param urlToUse The url to process authorization
     * @param authorizationType The type of SSO authorization
     */
    static async processSSOPuppeteer(urlToUse: string, authorizationType: 'Google' | 'Github' | 'SAML'): Promise<void> {
        const ssoAuthorizationPage = new SsoAuthorizationPage();
        const userDataDir = path.resolve(__dirname, '../test-data/Default');
        const { browser, page } = await connect({
            headless: false,
            args: [],
            customConfig: {
                userDataDir: userDataDir
            },
            turnstile: true,
            connectOption: {},
            disableXvfb: true,
            ignoreAllFlags: false,
        })

        try {
            await ssoAuthorizationPage.signInUsingSso(authorizationType, page, urlToUse, samlUser, samlUserPassword);

            const currentUrl = page.url();
            const parts = currentUrl.split('?');
            const modifiedUrl = parts.length > 1 ? parts[1] : currentUrl;

            const protocol = 'redisinsight://';
            const callbackUrl = 'cloud/oauth/callback';
            const redirectUrl = `${protocol}${callbackUrl}?${modifiedUrl}`;

            await this.openRedisInsightWithDeeplink(redirectUrl);


        } catch (error) {
            console.error('Error during SSO:', error);
            // Take a screenshot if there's an error
            fs.mkdirSync('./report/screenshots/', { recursive: true });
            const screenshot = await page.screenshot();
            fs.writeFileSync(`./report/screenshots/puppeteer_screenshot_${Common.generateWord(5)}.png`, screenshot, 'base64');
            throw error;
        } finally {
            await browser.close();
        }
    }

    /**
     * Helper function for waiting for timeout
     */
    static async waitForTimeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Open Redis Insight electron app using deeplink
     * @param redirectUrl The redirect url for deeplink
     */
    static async openRedisInsightWithDeeplink(redirectUrl: string) {
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
    }
}
