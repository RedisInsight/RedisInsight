import {t} from 'testcafe';
import { MemoryEfficiencyPage } from '../pageObjects';

const memoryEfficiencyPage = new MemoryEfficiencyPage();
export class MemoryEfficiencyActions {
    /*
        vote for very useful and verify others are disabled
    */
    async voteForVeryUsefulAndVerifyDisabled(): Promise<void> {
        await t.click(memoryEfficiencyPage.veryUsefulVoteBtn);
        await this.verifyVoteDisabled();
    }
    /*
        vote for useful and verify others are disabled
    */
    async voteForUsefulAndVerifyDisabled(): Promise<void> {
        await t.click(memoryEfficiencyPage.usefulVoteBtn);
        await this.verifyVoteDisabled();
    }
    /*
        vote for not useful and verify others are disabled
    */
    async voteForNotUsefulAndVerifyDisabled(): Promise<void> {
        await t.click(memoryEfficiencyPage.notUsefulVoteBtn);
        await this.verifyVoteDisabled();
    }
    async verifyVoteDisabled(): Promise<void>{
        // Verify that user can rate recommendations with one of 3 existing types at the same time
        await t.expect(memoryEfficiencyPage.veryUsefulVoteBtn
            .hasAttribute('disabled')).ok('very useful vote button is not disabled');
        await t.expect(memoryEfficiencyPage.usefulVoteBtn
            .hasAttribute('disabled')).ok('useful vote button is not disabled');
        await t.expect(memoryEfficiencyPage.notUsefulVoteBtn
            .hasAttribute('disabled')).ok('not useful vote button is not disabled');
    }
}
