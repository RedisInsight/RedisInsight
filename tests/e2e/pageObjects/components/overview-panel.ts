import { Selector, t } from 'testcafe';

export class OverviewPanel {
    // TEXT ELEMENTS
    overviewTotalKeys = Selector('[data-test-subj=overview-total-keys]');
    overviewTotalMemory = Selector('[data-test-subj=overview-total-memory]');
    databaseModules = Selector('[data-testid$=module]');
    overviewTooltipStatTitle = Selector('[data-testid=overview-db-stat-title]');
    overviewCpu = Selector('[data-test-subj=overview-cpu]');
    overviewConnectedClients = Selector('[data-test-subj=overview-connected-clients]');
    overviewCommandsSec = Selector('[data-test-subj=overview-commands-sec]');
    overviewSpinner = Selector('[class^= euiLoadingSpinner--medium]');
    // BUTTONS
    myRedisDBLink = Selector('[data-testid=my-redis-db-btn]', { timeout: 1000 });
    overviewRedisStackLogo = Selector('[data-testid=redis-stack-logo]');
    overviewMoreInfo = Selector('[data-testid=overview-more-info-button]');
    changeIndexBtn = Selector('[data-testid=change-index-btn]');
    applyButton = Selector('[data-testid=apply-btn]');
    databaseInfoIcon = Selector('[data-testid=db-info-icon]');
    // PANEL
    overviewTooltip = Selector('[data-testid=overview-more-info-tooltip]');
    databaseInfoToolTip = Selector('[data-testid=db-info-tooltip]', { timeout: 2000 });
    // INPUTS
    changeIndexInput = Selector('[data-testid=change-index-input]');

    /**
     * Change database index
     * @param dbIndex The index of logical database
     */
    async changeDbIndex(dbIndex: number): Promise<void> {
        await t.click(this.changeIndexBtn)
            .typeText(this.changeIndexInput, dbIndex.toString(), { replace: true, paste: true })
            .click(this.applyButton)
            .expect(this.changeIndexBtn.textContent).contains(dbIndex.toString());
    }

    /**
     * Verify that definite database index selected
     * @param dbIndex The index of logical database
     */
    async verifyDbIndexSelected(dbIndex: number): Promise<void> {
        await t.expect(this.changeIndexBtn.textContent).contains(dbIndex.toString());
    }

    /**
     * wait for cpu is displayed
     */
    async waitForCpuIsCalculated(): Promise<void> {
        await t.expect(this.overviewSpinner.visible).notOk('cpu is not calculated, spinner is still displayed');
    }
}
