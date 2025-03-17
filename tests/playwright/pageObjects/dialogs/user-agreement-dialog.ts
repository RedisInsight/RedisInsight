import { expect, Locator, Page } from '@playwright/test'
import {BasePage} from '../base-page'
import { UserAgreementSelectors } from '../../selectors'

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
        this.userAgreementsPopup = page.getByTestId(UserAgreementSelectors.userAgreementsPopup)
        this.submitButton = page.getByTestId(UserAgreementSelectors.submitButton)
        this.switchOptionEula = page.getByTestId(UserAgreementSelectors.switchOptionEula)
        this.switchOptionEncryption = page.getByTestId(UserAgreementSelectors.switchOptionEncryption)
        this.pluginSectionWithText = page.getByTestId(UserAgreementSelectors.pluginSectionWithText)
        this.recommendedSwitcher = page.getByTestId(UserAgreementSelectors.recommendedSwitcher)
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
         return await this.userAgreementsPopup.isVisible()
    }
}
