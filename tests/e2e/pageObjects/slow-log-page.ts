import { Selector, t } from 'testcafe';

export class SlowLogPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //CSS Selectors
    cssSelectorDurationValue = '[data-testid=duration-value]';
    //BUTTONS
    slowLogPageButton = Selector('[data-testid=slowlog-page-btn]');
    slowLogSortByTimestamp = Selector('[data-testid=header-sorting-button]');
    slowLogNumberOfCommandsDropdown = Selector('[data-testid=count-select]');
    slowLogConfigureButton = Selector('[data-testid=configure-btn]');
    slowLogConfigureUnitButton = Selector('[data-test-subj=select-default-unit]');
    slowLogConfigureMilliSecondsUnit = Selector('[data-test-subj=unit-milli-second]');
    slowLogConfigureMicroSecondsUnit = Selector('[data-test-subj=unit-micro-second]');
    slowLogSaveConfigureButton = Selector('[data-testid=slowlog-config-save-btn]');
    slowLogCancelConfigureButton = Selector('[data-testid=slowlog-config-cancel-btn]');
    slowLogDefaultConfigureButton = Selector('[data-testid=slowlog-config-default-btn]');
    slowLogRefreshButton = Selector('[data-testid=refresh-slowlog-btn]');
    slowLogClearButton = Selector('[data-testid=clear-btn]');
    slowLogConfirmClearButton = Selector('[data-testid=reset-confirm-btn]');
    //INPUTS
    slowLogSlowerThanConfig = Selector('[data-testid=slower-than-input]');
    slowLogMaxLengthConfig = Selector('[data-testid=max-len-input]');
    //TEXT ELEMENTS
    slowLogTimestampValue = Selector('[data-testid=timestamp-value]');
    slowLogDurationValue = Selector(this.cssSelectorDurationValue);
    slowLogCommandValue = Selector('[data-testid=command-value]');
    slowLogEmptyResult = Selector('[data-testid=empty-slow-log]');
    slowLogCommandStatistics = Selector('[data-testid=entries-from-timestamp]');
    // Table
    slowLogTable = Selector('[data-testid=slowlog-table]');

    /**
     * Set value for slowlog-log-slower-than parameter
     * @param slowerThan Value for slowlog-log-slower-than property
     * @param unit Value for unit property
     */
    async changeSlowerThanParameter(slowerThan: number, unit?: Selector): Promise<void> {
        await t.click(this.slowLogConfigureButton);
        await t.typeText(this.slowLogSlowerThanConfig, slowerThan.toString(), { replace: true });
        if (unit !== undefined) {
            // await t.debug();
            await t.click(this.slowLogConfigureUnitButton);
            await t.click(unit);
        }
        await t.click(this.slowLogSaveConfigureButton);
    }

    /**
     * Set value for slowlog-max-len parameter
     * @param maxLength Value for slowlog-max-len property
     */
    async changeMaxLengthParameter(maxLength: number): Promise<void> {
        await t.click(this.slowLogConfigureButton);
        await t.typeText(this.slowLogMaxLengthConfig, maxLength.toString(), { replace: true });
        await t.click(this.slowLogSaveConfigureButton);
    }

    /**
     * Compare command displayed in the table with specified slowlog-log-slower-than parameter
     * @param command command for comparing
     * @param slowerThan time to compare
     */
    async compareCommandExecutionWithSlowerThan(command: string, slowerThan: number): Promise<void> {
        // Get duration of specified command
        const duration = await this.slowLogCommandValue.withExactText(command).parent(3).find(this.cssSelectorDurationValue).textContent;
        await t.expect(parseInt(duration)).gte(slowerThan, 'Displayed command time execution is more than specified');
    }

    /**
     * Change Display Up To parameter in Slow Log
     * @param number number of commands to display
     */
    async changeDisplayUpToParameter(number: number): Promise<void> {
        await t.click(this.slowLogNumberOfCommandsDropdown);
        // console.log(`button[id='${number}']`);
        const dropdownSelector = Selector('button').withAttribute('id', `${number}`);
        await t.click(dropdownSelector);
        if (number === -1) {
            await t.expect(this.slowLogNumberOfCommandsDropdown.withExactText('Max available').exists).ok('Value is applied');
        }
        else {
            await t.expect(this.slowLogNumberOfCommandsDropdown.withExactText(number.toString()).exists).ok('Value is applied');
        }
    }

    /**
     * Reset max-length and slowlog-log-slower-than to default
     */
    async resetToDefaultConfig(): Promise<void> {
        await t.click(this.slowLogConfigureButton);
        await t.click(this.slowLogDefaultConfigureButton);
        await t.expect(this.slowLogSlowerThanConfig.withAttribute('value', '10000').exists).ok('Default Slower Than');
        await t.expect(this.slowLogMaxLengthConfig.withAttribute('value', '128').exists).ok('Default Max Length');
        await t.expect(this.slowLogConfigureUnitButton.withExactText('µs').exists).ok('Default Slower Than');
        await t.click(this.slowLogSaveConfigureButton);
    }
}
