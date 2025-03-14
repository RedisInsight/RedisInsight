import {Locator, Page} from '@playwright/test'

export default class BasePage {
    protected page: Page

    constructor(page: Page) {
        this.page = page
    }

    async reload(): Promise<void> {
        await this.page.reload()
    }

    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url)
    }

    async navigateToHomeUrl(): Promise<void> {
        await this.page.goto('/')
    }

    async click(locator: Locator): Promise<void> {
        await locator.click()
    }

    async fill(selector: string, value: string): Promise<void> {
        await this.page.fill(selector, value)
    }

    async getText(selector: string): Promise<string> {
        return await this.page.textContent(selector) || ''
    }

    async isVisible(locator: Locator): Promise<boolean> {
        return locator.isVisible()
    }

    async getByTestId(testId: string): Promise<Locator> {
        return this.page.getByTestId(testId)
    }
}
