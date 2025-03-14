import { Page } from '@playwright/test'

export default class BasePage {
    protected page: Page

    constructor(page: Page) {
        this.page = page
    }

    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url)
    }

    async navigateToHomeUrl(): Promise<void> {
        await this.page.goto('/')
    }

    async click(selector: string): Promise<void> {
        await this.page.click(selector)
    }

    async fill(selector: string, value: string): Promise<void> {
        await this.page.fill(selector, value)
    }

    async getText(selector: string): Promise<string> {
        return await this.page.textContent(selector) || ''
    }

    async isVisible(selector: string): Promise<boolean> {
        return this.page.isVisible(selector)
    }

    protected getByTestId(testId: string, options?: { timeout?: number }): Locator {
        return this.page.getByTestId(testId, options)
    }
}
