import {t} from 'testcafe';
import { MemoryEfficiencyPage } from '../pageObjects';

const memoryEfficiencyPage = new MemoryEfficiencyPage();
export class MemoryEfficiencyActions {
    async voteForVeryUsefulAndVerifyDisabled(): Promise<void> {
        await t.click(memoryEfficiencyPage.veryUsefulVoteBtn);
        await this.verifyVoteDisabled();
    }

    async voteForUsefulAndVerifyDisabled(): Promise<void> {
        await t.click(memoryEfficiencyPage.usefulVoteBtn);
        await this.verifyVoteDisabled();
    }

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
