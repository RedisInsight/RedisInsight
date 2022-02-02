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
    .beforeEach(async() => {
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
test
    .after(async t => {
        //Clear database
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
    })
    ('Verify that user can repeat commands by entering a number of repeats before the Redis command in CLI', async t => {
        const command = 'SET a a';
        const repeats = 10;
        //Open CLI and run command with repeats
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, `${repeats} ${command}`);
        await t.pressKey('enter');
        //Verify result
        await t.expect(cliPage.cliOutputResponseSuccess.count).eql(repeats, `CLI contains ${repeats} results`);
});
