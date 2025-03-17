import { Locator, Page } from '@playwright/test'
import {BasePage} from "../base-page";

export class RedisCloudSigninPanel extends BasePage {
    private readonly ssoOauthButton: Locator
    private readonly ssoEmailInput: Locator
    private readonly submitBtn: Locator
    private readonly oauthAgreement: Locator
    private readonly googleOauth: Locator
    private readonly githubOauth: Locator
    private readonly ssoOauth: Locator

    constructor(page: Page) {
        super(page)
        this.ssoOauthButton = page.getByTestId('sso-oauth')
        this.ssoEmailInput = page.getByTestId('sso-email')
        this.submitBtn = page.getByTestId('btn-submit')
        this.oauthAgreement = page.locator('[for="ouath-agreement"]')
        this.googleOauth = page.getByTestId('google-oauth')
        this.githubOauth = page.getByTestId('github-oauth')
        this.ssoOauth = page.getByTestId('sso-oauth')
    }
}
