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

    /**
     * Expand/Collapse Recommendation
     * @param recommendationName Name of recommendation
     * @param state State of recommendation
     */
    async toggleRecommendation(recommendationName: string, state: boolean): Promise<void> {
        const recommendationAccordeon = Selector(`[data-testid=${recommendationName}-accordion]`);
        const recommendationSelector = Selector(`[data-test-subj=${recommendationName}-button]`);
        const isRecommendationExpanded = await recommendationAccordeon.withAttribute('class', /-isOpen/).exists;

        if (state !== isRecommendationExpanded) {
            await t.click(recommendationSelector);
        }
    }
}
