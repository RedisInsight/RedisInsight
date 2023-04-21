import { Selector, t } from 'testcafe';
import { RecommendationIds } from '../helpers/constants';

export class InsightsPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    // BUTTONS
    insightsBtn = Selector('[data-testid=recommendations-trigger]');
    showHiddenCheckBox = Selector('[data-testid=checkbox-show-hidden]');
    showHiddenButton = Selector('[data-testid=checkbox-show-hidden ] ~ label');
    // CONTAINERS
    insightsPanel = Selector('[data-testid=insights-panel]');
    noRecommendationsScreen = Selector('[data-testid=no-recommendations-screen]');
    redisVersionRecommendation = Selector('[data-testid=redisVersion-recommendation]');
    optimizeTimeSeriesRecommendation = Selector('[data-testid=RTS-recommendation]');
    goToDbAnalysisButton = Selector('[data-testid=insights-db-analysis-link]');

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
     * Get Insights panel recommendation selector by name
     * @param recommendationName name of the recommendation
     */
    getRecommendationByName(recommendationName: RecommendationIds): Selector {
        return Selector(`[data-testid=${recommendationName}-accordion]`);
    }

    /**
     * Check/uncheck recommendation
     * @param state State of panel
     */
    async toggleShowHiddenRecommendations(state: boolean): Promise<void> {
        if ((await this.showHiddenCheckBox.checked) !== state) {
            await t.click(this.showHiddenButton);
        }
    }

    /**
     * Expand/Collapse Recommendation
     * @param recommendationName Name of recommendation
     * @param state State of recommendation
     */
    async toggleRecommendation(recommendationName: RecommendationIds, state: boolean): Promise<void> {
        const recommendationSelector = Selector(`[data-test-subj=${recommendationName}-button]`);
        const isRecommendationExpanded = await this.getRecommendationByName(recommendationName).withAttribute('class', /-isOpen/).exists;

        if (state !== isRecommendationExpanded) {
            await t.click(recommendationSelector);
        }
    }

    /**
     * Hide Recommendation
     * @param recommendationName Name of recommendation
     */
    async hideRecommendation(recommendationName: RecommendationIds): Promise<void> {
        const recommendationHideBtn = Selector(`[data-testid=toggle-hide-${recommendationName}-btn]`);
        await t.click(recommendationHideBtn);
    }

    /**
     * Snooze Recommendation
     * @param recommendationName Name of recommendation
     */
    async snoozeRecommendation(recommendationName: RecommendationIds): Promise<void> {
        const recommendationSnoozeBtn = Selector(`[data-testid=${recommendationName}-delete-btn]`);
        await t.click(recommendationSnoozeBtn);
    }
}
