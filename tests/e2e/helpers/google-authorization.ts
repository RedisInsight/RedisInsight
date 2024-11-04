import { Builder, By, Key, until } from 'selenium-webdriver';
import * as fs from 'fs';
import { exec } from 'child_process';
import chrome = require('selenium-webdriver/chrome');
import { googleUser, googleUserPassword } from './conf';

export async function processGoogleSSO(urlToUse: string): Promise<void> {
    // Set Chrome options
    const chromeOptions = new chrome.Options();
    chromeOptions.addArguments(
        '--disable-web-security',
        '--remote-allow-origins=*',
        '--allow-running-insecure-content',
        '--disable-client-side-phishing-detection',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-domain-reliability',
        '--disable-default-apps',
        '--no-default-browser-check',
        // '--no-sandbox',
        '--disable-plugins-discovery',
        '--disable-extensions',
        '--disable-popup-blocking',
        '--profile-directory=Default',
        '--ignore-certificate-errors',
        // '--disable-blink-features=AutomationControlled',
        '--incognito',
        'user_agent=DN'
    );
    // Create a WebDriver instance with ChromeDriver
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

    const protocol = 'redisinsight://';
    const callbackUrl = 'cloud/oauth/callback';

    try {
        await driver.get(urlToUse);
        await driver.findElement(By.css('input[type="email"]')).sendKeys(googleUser, Key.RETURN);
        await driver.wait(until.elementLocated(By.css('input[type="password"]')), 10000);
        await driver.sleep(Math.random() * 1000 + 500);
        await driver.findElement(By.css('input[type="password"]')).sendKeys(googleUserPassword, Key.RETURN);
        await driver.sleep(Math.random() * 1000 + 500);
        const elements = await driver.findElements(By.xpath("//*[text()='Try another way']"));
        if (elements.length > 0 && await elements[0].isDisplayed()) {
            await elements[0].click();
        } else {
            console.log("'Try another way' button not found or not visible.");
        }

        // Wait for the authorization to complete and the redirect to your specified URI
        await driver.wait(until.urlContains('#success'), 10000);

        const currentUrl = await driver.getCurrentUrl();
        const parts = currentUrl.split('?');
        const modifiedUrl = parts.length > 1 ? parts[1] : currentUrl;
        const redirectUrl = `${protocol + callbackUrl}?${modifiedUrl}`;

        // Open Redis Insight electron app using deeplink
        if (process.platform === 'linux') {
            console.log('redirectUrl: ', redirectUrl)
            exec(`xdg-open "${redirectUrl}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('error opening redis insight on linux', error);
                    return;
                }
                console.log('Redis Insight opened successfully', stdout)
            })
        } else {
            const open = (await import('open')).default;
            await open(redirectUrl, { app: { name: 'Redis Insight' } });
        }
    }
    catch (error) {
        console.error('Error during Google SSO automation:', error);

        fs.mkdirSync('./report/screenshots/', { recursive: true });
        // Take a screenshot if there's an error
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync('./report/screenshots/selenium_screenshot.png', screenshot, 'base64');
        console.log('Screenshot saved as screenshot.png');
    }
    finally {
        await driver.quit();
    }
}
