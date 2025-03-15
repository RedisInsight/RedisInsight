import { expect, Locator, Page } from '@playwright/test'
import BasePage from './base-page'

export class UserAgreementDialog extends BasePage {

    // Private selectors
    private readonly userAgreementsPopup: Locator
    private readonly submitButton: Locator
    private readonly switchOptionEula: Locator
    private readonly switchOptionEncryption: Locator
    private readonly pluginSectionWithText: Locator
    private readonly recommendedSwitcher: Locator

    constructor(page: Page) {
        super(page)
        this.userAgreementsPopup = this.getByTestId('consents-settings-popup')
        this.submitButton = this.getByTestId('btn-submit')
        this.switchOptionEula = this.getByTestId('switch-option-eula')
        this.switchOptionEncryption = this.getByTestId('switch-option-encryption')
        this.pluginSectionWithText = this.getByTestId('plugin-section')
        this.recommendedSwitcher = this.getByTestId('switch-option-recommended')
    }

    async acceptLicenseTerms(): Promise<void> {
        if (await this.switchOptionEula.isVisible) {
            await this.recommendedSwitcher.click()
            await this.switchOptionEula.click()
            await this.submitButton.click()
            await expect(this.userAgreementsPopup).not.toBeVisible({ timeout: 2000 })
        }
    }

    async getRecommendedSwitcherValue(): Promise<string | null> {
        return this.recommendedSwitcher.getAttribute('aria-checked')
    }

    async isUserAgreementDialogVisible(): Promise<boolean> {
        return this.isVisible(this.userAgreementsPopup)
    }
}
