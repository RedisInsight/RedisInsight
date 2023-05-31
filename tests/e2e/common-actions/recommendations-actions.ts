import { Selector, t } from 'testcafe';

export class RecommendationsActions {
    /**
     * Get recommendation container by name
     * @param recommendationName Name of recommendation
     */
    async getRecommendationSelectorByName(recommendationName: string): Promise<Selector> {
        return Selector(`[data-testid=${recommendationName}-recommendation]`);
    }

    /**
     * Get vote selector by recommendation name
     * @param recommendationName Name of recommendation
     * @param option Option can be "useful/not-useful"
     */
    async getVoteSelectorByName(recommendationName: string, option: string): Promise<Selector> {
        const recomSelector = await this.getRecommendationSelectorByName(recommendationName);

        return recomSelector.find(`[data-testid='${option}-vote-btn']`);
    }

    /**
     * Vote for recommendation by name and option
     * @param recommendationName Name of recommendation
     * @param option Option can be "useful/not-useful"
     */
    async voteForRecommendation(recommendationName: string, option: string): Promise<void> {
        const voteSelector = await this.getVoteSelectorByName(recommendationName, option);

        await t.click(voteSelector);
    }

    /**
     * Verify that vote is selected by recommendation name and option
     * @param recommendationName Name of recommendation
     * @param option Option can be "useful/not-useful"
     */
    async verifyVoteIsSelected(recommendationName: string, option: string): Promise<void> {
        const voteSelector = await this.getVoteSelectorByName(recommendationName, option);

        await t.expect(voteSelector.getAttribute('class')).contains('selected', `${option} vote button for ${recommendationName} recommendation is not selected`);
    }

    /**
     * Verify that vote popup is displayed by recommendation name and option
     * @param recommendationName Name of recommendation
     * @param option Option can be "useful/not-useful"
     */
    async verifyVotePopUpIsDisplayed(recommendationName: string, option: string): Promise<void> {
        const popoverSelector = Selector(`[data-testid='${recommendationName}-${option}-popover']`);
        await t.expect(popoverSelector.visible).ok(`popover is displayed for ${recommendationName}`);
    }
}
