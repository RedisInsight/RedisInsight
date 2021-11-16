import { Selector, t } from 'testcafe';

export class SettingsPage {
    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

    applyButton: Selector
    accordionAppearance: Selector
    accordionPrivacySettings: Selector
    accordionAdvancedSettings: Selector
    switchAnalyticsOption: Selector
    switchEulaOption: Selector
    submitConsentsPopupButton: Selector
    keysToScanValue: Selector
    keysToScanInput: Selector

    constructor() {
        //-------------------------------------------------------------------------------------------
        //DECLARATION OF SELECTORS
        //*Declare all elements/components of the relevant page.
        //*Target any element/component via data-id, if possible!
        //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
        //-------------------------------------------------------------------------------------------
        //BUTTONS
        this.applyButton = Selector('[data-testid=apply-btn]');
        this.accordionAppearance = Selector('[data-test-subj=accordion-appearance]');
        this.accordionPrivacySettings = Selector('[data-test-subj=accordion-privacy-settings]');
        this.accordionAdvancedSettings = Selector('[data-test-subj=accordion-advanced-settings]');
        this.switchAnalyticsOption = Selector('[data-testid=switch-option-analytics]');
        this.switchEulaOption = Selector('[data-testid=switch-option-eula]');
        this.submitConsentsPopupButton = Selector('[data-testid=consents-settings-popup] [data-testid=btn-submit]');
        // TEXT INPUTS (also referred to as 'Text fields')
        this.keysToScanValue = Selector('[data-testid=keys-to-scan-value]');
        this.keysToScanInput = Selector('[data-testid=keys-to-scan-input]');
    }

    /**
     * Change Keys to Scan value
     * @param value Value for scan
     */
    async changeKeysToScanValue(value: string): Promise<void>{
        await t.hover(this.keysToScanValue);
        await t.click(this.keysToScanInput);
        await t.typeText(this.keysToScanInput, value, { replace: true });
        await t.click(this.applyButton);
    }

    async getAnalyticsValue(): Promise<string> {
        return await this.switchAnalyticsOption.getAttribute('aria-checked');
    }
}
