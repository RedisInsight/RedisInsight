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
     * Open/Close Insights Panel
     * @param state State of panel
     */
    async toggleInsightsPanel(state: boolean): Promise<void> {
        const isPanelExists = await this.insightsPanel.exists;

        if (state !== isPanelExists) {
            await t.click(this.insightsBtn);
        }
    }
}
