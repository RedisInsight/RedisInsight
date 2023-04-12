import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const common = new Common();
const browserPage = new BrowserPage();

let keyName = common.generateWord(20);
const keyTTL = '2147476121';
const jsonValue = '{"name":"xyz"}';
const cliCommands = ['get test', 'acl help', 'client list'];

fixture `CLI`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see CLI is minimized when he clicks the "minimize" button', async t => {
    const cliColourBefore = await common.getBackgroundColour(browserPage.Cli.cliBadge);

    // Open CLI and minimize
    await t.click(browserPage.Cli.cliExpandButton);
    await t.click(browserPage.Cli.minimizeCliButton);
    // Verify cli is minimized
    const cliColourAfter = await common.getBackgroundColour(browserPage.Cli.cliBadge);
    await t.expect(cliColourAfter).notEql(cliColourBefore, 'CLI badge colour is not changed');
    await t.expect(browserPage.Cli.minimizeCliButton.visible).eql(false, 'CLI is not mimized');
});
test('Verify that user can see results history when he re-opens CLI after minimizing', async t => {
    const command = 'SET key';

    // Open CLI and run commands
    await t.click(browserPage.Cli.cliExpandButton);
    await t.typeText(browserPage.Cli.cliCommandInput, command, { replace: true, paste: true });
    await t.pressKey('enter');
    // Minimize and re-open cli
    await t.click(browserPage.Cli.minimizeCliButton);
    await t.click(browserPage.Cli.cliExpandButton);
    // Verify cli results history
    await t.expect(browserPage.Cli.cliCommandExecuted.textContent).eql(command, 'CLI results history not persists after reopening');
});
test
    .after(async() => {
        // Clear database and delete
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can repeat commands by entering a number of repeats before the Redis command in CLI', async t => {
        keyName = common.generateWord(20);
        const command = `SET ${keyName} a`;
        const repeats = 10;

        // Open CLI and run command with repeats
        await t.click(browserPage.Cli.cliExpandButton);
        await t.typeText(browserPage.Cli.cliCommandInput, `${repeats} ${command}`, { replace: true, paste: true });
        await t.pressKey('enter');
        // Verify result
        await t.expect(browserPage.Cli.cliOutputResponseSuccess.count).eql(repeats, `CLI not contains ${repeats} results`);
    });
test
    .after(async() => {
        // Clear database and delete
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can run command json.get and see JSON object with escaped quotes (\" instead of ")', async t => {
        keyName = common.generateWord(20);
        const jsonValueCli = '"{\\"name\\":\\"xyz\\"}"';

        // Add Json key with json object
        await browserPage.addJsonKey(keyName, jsonValue, keyTTL);
        const command = `JSON.GET ${keyName}`;
        // Open CLI and run command
        await t.click(browserPage.Cli.cliExpandButton);
        await t.typeText(browserPage.Cli.cliCommandInput, command, { replace: true, paste: true });
        await t.pressKey('enter');
        // Verify result
        await t.expect(browserPage.Cli.cliOutputResponseSuccess.innerText).eql(jsonValueCli, 'The user can not see JSON object with escaped quotes');
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        for (const command of cliCommands) {
            await browserPage.Cli.sendCommandInCli(command);
        }
    })
    .after(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can use "Up" and "Down" keys to view previous commands in CLI in the application', async t => {
        const databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}`;

        await t.click(browserPage.Cli.cliExpandButton);
        // Verify that user can see DB endpoint in the header of CLI
        await t.expect(browserPage.Cli.cliEndpoint.textContent).eql(databaseEndpoint, 'The user can not see DB endpoint in the header of CLI');

        await t.expect(browserPage.Cli.cliCommandInput.innerText).eql('');
        for (let i = cliCommands.length - 1; i >= 0; i--) {
            await t.pressKey('up');
            await t.expect(browserPage.Cli.cliCommandInput.innerText).eql(cliCommands[i]);
        }
        for (let i = 0; i < cliCommands.length; i++) {
            await t.expect(browserPage.Cli.cliCommandInput.innerText).eql(cliCommands[i]);
            await t.pressKey('down');
        }
    });
