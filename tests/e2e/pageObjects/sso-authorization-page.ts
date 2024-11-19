import { PageWithCursor } from "puppeteer-real-browser";
import { SsoAuthorization } from "../helpers";

export class SsoAuthorizationPage {
    // BUTTONS
    submitFormButton = 'input[type="submit"]';
    tryAnotherWayButton = `//*[text()='Try another way']`
    googleNextButton = '#identifierNext';
    googleSubmitPasswordButton = '#passwordNext';
    // INPUTS
    oktaUserNameInput = 'input[autocomplete="username"]';
    oktaPasswordInput = 'input[autocomplete="current-password"]';
    googleEmailInput = 'input[type="email"]';
    goooglePasswordInput = 'input[type="password"]';
    githubUserNameInput = '#login_field';
    githubPasswordInput = '#password';

    /**
     * Sign in using SSO
     * @param authorizationType The authorization page type 'Google' || 'Github' || 'SAML'
     * @param page Puppeteer page instance
     * @param urlToUse The url to process authorization
     * @param username The username to okta account
     * @param password The password to okta account
     */
    async signInUsingSso(authorizationType: 'Google' | 'Github' | 'SAML', page: PageWithCursor, urlToUse: string, username: string, password: string): Promise<void> {
        await page.goto(urlToUse);
        await SsoAuthorization.waitForTimeout(2000);


        switch (authorizationType) {
            case 'SAML':
                await this.submitOktaForm(page, username, password);
                break;
            case 'Google':
                await this.submitGoogleForm(page, username, password);
                break;
            case 'Github':
                await this.submitGithubForm(page, username, password);
                break;
            default:
                throw new Error(`Unsupported authorization type: ${authorizationType}`);
        }

        await SsoAuthorization.waitForTimeout(2000);
        // Wait for the authorization to complete
        await page.waitForFunction(() => window.location.href.includes('#success'), { timeout: 11000 });
    }

    /**
     * Submit login OKTA form
     * @param urlToUse The url to process authorization
     * @param username The username to okta account
     * @param password The password to okta account
     */
    async submitOktaForm(page: PageWithCursor, username: string, password: string): Promise<void> {
        await page.waitForSelector(this.oktaUserNameInput, { visible: true });
        await page.type(this.oktaUserNameInput, username, { delay: Math.random() * 100 + 50 });
        await page.type(this.oktaPasswordInput, password, { delay: Math.random() * 100 + 50 });
        await page.click(this.submitFormButton);
    }

    /**
     * Submit login Google form
     * @param page Puppeteer page instance
     * @param username The username to okta account
     * @param password The password to okta account
     */
    async submitGoogleForm(page: PageWithCursor, username: string, password: string): Promise<void> {
        await page.waitForSelector(this.googleEmailInput, { visible: true });
        await page.type(this.googleEmailInput, username, { delay: Math.random() * 100 + 50 });
        await Promise.all([
            page.click(this.googleNextButton),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);
        await page.waitForSelector(this.goooglePasswordInput, { visible: true });
        await SsoAuthorization.waitForTimeout(500);

        await page.type(this.goooglePasswordInput, password, { delay: Math.random() * 100 + 50 });
        await Promise.all([
            page.click(this.googleSubmitPasswordButton),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);
        await SsoAuthorization.waitForTimeout(500);

        // Check for "Try another way" button
        const tryAnotherWayButtons = await page.$$(this.tryAnotherWayButton);
        if (tryAnotherWayButtons.length > 0) {
            const buttonVisible = await tryAnotherWayButtons[0].isIntersectingViewport();
            if (buttonVisible) {
                await tryAnotherWayButtons[0].click();
            } else {
                console.log("'Try another way' button not found or not visible.");
            }
        }
    }

    /**
     * Submit login GitHub form
     * @param urlToUse The url to process authorization
     * @param username The username to okta account
     * @param password The password to okta account
     */
    async submitGithubForm(page: PageWithCursor, username: string, password: string): Promise<void> {
        await page.waitForSelector(this.githubUserNameInput, { visible: true });
        await page.type(this.githubUserNameInput, username, { delay: Math.random() * 100 + 50 });
        await page.type(this.githubPasswordInput, password, { delay: Math.random() * 100 + 50 });
        await page.click(this.submitFormButton);
    }
}
