import {Selector, t} from 'testcafe';

export class RecommendationsPage {
    veryUsefulVoteBtn = Selector('[data-testid=very-useful-vote-btn]').nth(0);
    usefulVoteBtn = Selector('[data-testid=useful-vote-btn]').nth(0);
    notUsefulVoteBtn = Selector('[data-testid=not-useful-vote-btn]').nth(0);
    recommendationsFeedbackBtn = Selector('[data-testid=recommendation-feedback-btn]');

    async voteForVeryUsefulAndVerifyDisabled(): Promise<void> {
        await t.click(this.veryUsefulVoteBtn);
        await this.verifyVoteDisabled();
    }

    async voteForUsefulAndVerifyDisabled(): Promise<void> {
        await t.click(this.usefulVoteBtn);
        await this.verifyVoteDisabled();
    }

    async voteForNotUsefulAndVerifyDisabled(): Promise<void> {
        await t.click(this.notUsefulVoteBtn);
        await this.verifyVoteDisabled();
    }

    async verifyVoteDisabled(): Promise<void>{
        // Verify that user can rate recommendations with one of 3 existing types at the same time
        await t.expect(this.veryUsefulVoteBtn
            .hasAttribute('disabled')).ok('very useful vote button is not disabled');
        await t.expect(this.usefulVoteBtn
            .hasAttribute('disabled')).ok('useful vote button is not disabled');
        await t.expect(this.notUsefulVoteBtn
            .hasAttribute('disabled')).ok('not useful vote button is not disabled');
    }
}
