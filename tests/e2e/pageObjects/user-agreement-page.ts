import { t, Selector } from 'testcafe';

export class UserAgreementPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //COMPONENTS
    userAgreementsPopup = Selector('[data-testid=consents-settings-popup]');
    //BUTTONS
    submitButton = Selector('[data-testid=btn-submit]');
    switchOptionEula = Selector('[data-testid=switch-option-eula]');
    switchOptionEncryption = Selector('[data-testid=switch-option-encryption]');
    pluginSectionWithText = Selector('[data-testid=plugin-section]');

    //Accept RedisInsight License Terms
    async acceptLicenseTerms(): Promise<void> {
        if (await this.switchOptionEula.exists) {
            await t.click(this.switchOptionEula);
            await t.click(this.switchOptionEncryption);
            await t.click(this.submitButton);
        }
    }
}
