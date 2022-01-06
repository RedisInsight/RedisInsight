import { acceptLicenseTermsAndAddDatabase } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import { CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const cliPage = new CliPage();
const common = new Common();

fixture `CLI`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
test('Verify that user can see CLI is minimized when he clicks the "minimize" button', async t => {
    const cliColourBefore = await common.getBackgroundColour(cliPage.cliBadge);
    //Open CLI and minimize
    await t.click(cliPage.cliExpandButton);
    await t.click(cliPage.minimizeCliButton);
    //Verify cli is minimized
    const cliColourAfter = await common.getBackgroundColour(cliPage.cliBadge);
    await t.expect(cliColourAfter).notEql(cliColourBefore, 'CLI badge colour is changed');
    await t.expect(cliPage.minimizeCliButton.visible).eql(false, 'CLI is mimized');
});
test('Verify that user can see results history when he re-opens CLI after minimizing', async t => {
    const command = 'SET key';
    //Open CLI and run commands
    await t.click(cliPage.cliExpandButton);
    await t.typeText(cliPage.cliCommandInput, command);
    await t.pressKey('enter');
    //Minimize and re-open cli
    await t.click(cliPage.minimizeCliButton);
    await t.click(cliPage.cliExpandButton);
    //Verify cli results history
    await t.expect(cliPage.cliCommandExecuted.textContent).eql(command, 'CLI results history persists after reopening');
});
