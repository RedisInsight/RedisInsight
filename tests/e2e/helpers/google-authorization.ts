import { Builder, By, Key, until } from 'selenium-webdriver';
import open = require('open');
import { googleUser, googleUserPassword } from './conf';

export async function processGoogleSSO(urlToUse: string): Promise<void> {
    // Create a WebDriver instance with ChromeDriver
    const driver = await new Builder()
        .forBrowser('chrome')
        .build();

    const protocol = 'redisinsight://';
    const callbackUrl = 'cloud/oauth/callback';

    try {
        await driver.get(urlToUse);
        await driver.findElement(By.css('input[type="email"]')).sendKeys(googleUser, Key.RETURN);
        await driver.wait(until.elementLocated(By.css('input[type="password"]')), 10000);
        await driver.sleep(2000);
        await driver.findElement(By.css('input[type="password"]')).sendKeys(googleUserPassword, Key.RETURN);

        // Wait for the authorization to complete and the redirect to your specified URI
        await driver.wait(until.urlContains('#success'), 30000);

        const currentUrl = await driver.getCurrentUrl();
        const parts = currentUrl.split('?');
        const modifiedUrl = parts.length > 1 ? parts[1] : currentUrl;
        const redirectUrl = `${protocol + callbackUrl  }?${  modifiedUrl}`;

        await open(redirectUrl, { app: { name: 'Redis Insight' } });
    }
    catch (error) {
        console.error('Error during Google SSO automation:', error);
    }
    finally {
        await driver.quit();
    }
}
