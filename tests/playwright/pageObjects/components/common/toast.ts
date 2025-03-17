import {Locator, Page} from '@playwright/test'
import {BasePage} from '../../base-page'
import {ToastSelectors} from '../../../selectors'

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
        this.toastHeader = page.locator(ToastSelectors.toastHeader)
        this.toastBody = page.locator(ToastSelectors.toastBody)
        this.toastSuccess = page.locator(ToastSelectors.toastSuccess)
        this.toastError = page.locator(ToastSelectors.toastError)
        this.toastCloseButton = page.locator(ToastSelectors.toastCloseButton)
        this.toastSubmitBtn = page.getByTestId(ToastSelectors.toastSubmitBtn)
        this.toastCancelBtn = page.getByTestId(ToastSelectors.toastCancelBtn)
    }


    async isCloseButtonVisible(): Promise<boolean> {
        return this.isVisible(ToastSelectors.toastCloseButton)
    }

    async closeToast(): Promise<void> {
        await this.toastCloseButton.click()
    }

    async getNotificationMessage(): Promise<string> {
        return this.toastHeader.textContent()
    }
}
