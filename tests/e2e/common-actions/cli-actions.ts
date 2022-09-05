import { t } from 'testcafe';
import { CliPage } from '../pageObjects';

const cliPage = new CliPage();

export class CliActions {
    
    /**
     * Check list of commands searched
     * @param searchedCommand Searched command in Command Helper
     * @param listToCompare The list with commands to compare with opened in Command Helper
     */
     async checkSearchedCommandInCommandHelper(searchedCommand: string, listToCompare: string[]): Promise<void> {
        await t.typeText(cliPage.cliHelperSearch, searchedCommand, { speed: 0.5 });
        //Verify results in the output
        const commandsCount = await cliPage.cliHelperOutputTitles.count;
        for (let i = 0; i < commandsCount; i++) {
            await t.expect(cliPage.cliHelperOutputTitles.nth(i).textContent).eql(listToCompare[i], 'Results in the output contains searched value');
        }
    }

    /**
    * Check commands list
    * @param listToCompare The list with commands to compare with opened in Command Helper
    */
    async checkCommandsInCommandHelper(listToCompare: string[]): Promise<void> {
        //Verify results in the output
        const commandsCount = await cliPage.cliHelperOutputTitles.count;
        for (let i = 0; i < commandsCount; i++) {
            await t.expect(cliPage.cliHelperOutputTitles.nth(i).textContent).eql(listToCompare[i], 'Results in the output not contain searched value');
        }
    }
}
