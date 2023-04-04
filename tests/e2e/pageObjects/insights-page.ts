import { Selector, t } from 'testcafe';

export class InsightsPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    // BUTTONS
    insightsBtn = Selector('[data-testid=recommendations-trigger]');
    // CONTAINERS
    insightsPanel = Selector('[data-testid=insights-panel]');
    noRecommendationsScreen = Selector('[data-testid=no-recommendations-screen]');
    redisVersionRecommendation = Selector('[data-testid=redisVersion-recommendation]');
    optimizeTimeSeriesRecommendation = Selector('[data-testid=RTS-recommendation]');

    /**
     * Open Insights Panel
     */
    async openInsightsPanel(): Promise<void> {
        if (!(await this.insightsPanel.exists)) {
            await t.click(this.insightsBtn);
        }
    }

    /**
     * Close Insights Panel
     */
    async closeInsightsPanel(): Promise<void> {
        if (await this.insightsPanel.exists) {
            await t.click(this.insightsBtn);
        }
    }
}
