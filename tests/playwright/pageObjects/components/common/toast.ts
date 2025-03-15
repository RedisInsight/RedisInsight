import {Locator, Page} from '@playwright/test'
import BasePage from '../../base-page'

export class Toast extends BasePage{
    private readonly toastHeader: Locator
    private readonly toastBody: Locator
    private readonly toastSuccess: Locator
    private readonly toastError: Locator
    private readonly toastCloseButton: Locator
    private readonly toastSubmitBtn: Locator
    private readonly toastCancelBtn: Locator

    constructor(page: Page) {
        super(page)
        this.toastHeader = page.getByTestId('euiToastHeader')
        this.toastBody = page.locator('[class*=euiToastBody]')
        this.toastSuccess = page.locator('[class*=euiToast--success]')
        this.toastError = page.locator('[class*=euiToast--danger]')
        this.toastCloseButton = page.getByTestId('toastCloseButton')
        this.toastSubmitBtn = page.getByTestId('submit-tooltip-btn')
        this.toastCancelBtn = page.getByTestId('toast-cancel-btn')
    }


    async isCloseButtonVisible(): Promise<boolean> {
        return this.isVisible(this.toastCloseButton)
    }

    async closeToast(): Promise<void> {
        await this.toastCloseButton.click()
    }

    async getNotificationMessage(): Promise<string> {
        return this.toastHeader.textContent()
    }
}
