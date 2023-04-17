import { Selector, t } from 'testcafe';

export class SettingsPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    accordionAppearance = Selector('[data-test-subj=accordion-appearance]');
    accordionPrivacySettings = Selector('[data-test-subj=accordion-privacy-settings]');
    accordionAdvancedSettings = Selector('[data-test-subj=accordion-advanced-settings]');
    accordionWorkbenchSettings = Selector('[data-test-subj=accordion-workbench-settings]');
    switchAnalyticsOption = Selector('[data-testid=switch-option-analytics]');
    switchEulaOption = Selector('[data-testid=switch-option-eula]');
    submitConsentsPopupButton = Selector('[data-testid=consents-settings-popup] [data-testid=btn-submit]');
    switchNotificationsOption = Selector('[data-testid=switch-option-notifications]');
    switchEditorCleanupOption = Selector('[data-testid=switch-workbench-cleanup]');
    applyButton = Selector('[data-testid=apply-btn]');
    //TEXT INPUTS (also referred to as 'Text fields')
    keysToScanValue = Selector('[data-testid=keys-to-scan-value]');
    keysToScanInput = Selector('[data-testid=keys-to-scan-input]');
    commandsInPipelineValue = Selector('[data-testid=pipeline-bunch-value]');
    commandsInPipelineInput = Selector('[data-testid=pipeline-bunch-input]');
    pipelineLink = Selector('[data-testid=pipelining-link]');

    /**
     * Change Keys to Scan value
     * @param value Value for scan
     */
    async changeKeysToScanValue(value: string): Promise<void> {
        await t
            .hover(this.keysToScanValue)
            .click(this.keysToScanInput)
            .typeText(this.keysToScanInput, value, { replace: true, paste: true })
            .click(this.applyButton);
    }

    /**
    * Change Commands In Pipeline value
    * @param value Value for pipeline
    */
    async changeCommandsInPipeline(value: string): Promise<void> {
        await t.hover(this.commandsInPipelineValue)
            .click(this.commandsInPipelineInput)
            .typeText(this.commandsInPipelineInput, value, { replace: true, paste: true })
            .click(this.applyButton);
    }

    /**
     * Get state of Analytics switcher
     */
    async getAnalyticsSwitcherValue(): Promise<string> {
        return await this.switchAnalyticsOption.getAttribute('aria-checked');
    }

    /**
     * Get state of Notifications switcher
     */
    async getNotificationsSwitcherValue(): Promise<string> {
        return await this.switchNotificationsOption.getAttribute('aria-checked');
    }

    /**
     * Get state of Eula switcher
     */
    async getEulaSwitcherValue(): Promise<string> {
        return await this.switchEulaOption.getAttribute('aria-checked');
    }

    /**
     * Get state of Editor Cleanup switcher
     */
    async getEditorCleanupSwitcherValue(): Promise<string> {
        return await this.switchEditorCleanupOption.getAttribute('aria-checked');
    }

    /**
    * Enable Editor Cleanup switcher
    * @param state Enabled(true) or disabled(false)
    */
    async changeEditorCleanupSwitcher(state: boolean): Promise<void> {
        const currentState = await this.getEditorCleanupSwitcherValue();
        if (currentState !== `${state}`) {
            await t.click(this.switchEditorCleanupOption);
        }
    }
}
