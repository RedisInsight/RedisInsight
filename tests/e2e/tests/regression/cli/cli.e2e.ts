import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import { BrowserPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { Chance } from 'chance';

const cliPage = new CliPage();
const common = new Common();
const chance = new Chance();
const browserPage = new BrowserPage();

let keyName = chance.word({ length: 20 });
const keyTTL = '2147476121';
const jsonValue = '{"name":"xyz"}';

fixture `CLI`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see CLI is minimized when he clicks the "minimize" button', async t => {
        const cliColourBefore = await common.getBackgroundColour(cliPage.cliBadge);
        //Open CLI and minimize
        await t.click(cliPage.cliExpandButton);
        await t.click(cliPage.minimizeCliButton);
        //Verify cli is minimized
        const cliColourAfter = await common.getBackgroundColour(cliPage.cliBadge);
        await t.expect(cliColourAfter).notEql(cliColourBefore, 'CLI badge colour is changed');
        await t.expect(cliPage.minimizeCliButton.visible).eql(false, 'CLI is mimized');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see results history when he re-opens CLI after minimizing', async t => {
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
    .meta({ rte: rte.standalone })
    ('Verify that user can see CLI is minimized when he clicks the "minimize" button', async t => {
        const cliColourBefore = await common.getBackgroundColour(cliPage.cliBadge);
        //Open CLI and minimize
        await t.click(cliPage.cliExpandButton);
        await t.click(cliPage.minimizeCliButton);
        //Verify cli is minimized
        const cliColourAfter = await common.getBackgroundColour(cliPage.cliBadge);
        await t.expect(cliColourAfter).notEql(cliColourBefore, 'CLI badge colour is changed');
        await t.expect(cliPage.minimizeCliButton.visible).eql(false, 'CLI is mimized');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see results history when he re-opens CLI after minimizing', async t => {
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
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Clear database and delete
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can repeat commands by entering a number of repeats before the Redis command in CLI', async t => {
        keyName = chance.word({ length: 20 });
        const command = `SET ${keyName} a`;
        const repeats = 10;
        //Open CLI and run command with repeats
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, `${repeats} ${command}`);
        await t.pressKey('enter');
        //Verify result
        await t.expect(cliPage.cliOutputResponseSuccess.count).eql(repeats, `CLI contains ${repeats} results`);
});
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Clear database and delete
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can run command json.get and see JSON object with escaped quotes (\" instead of ")', async t => {
        keyName = chance.word({ length: 20 });
        const jsonValueCli = '"{\\"name\\":\\"xyz\\"}"';
        //Add Json key with json object
        await browserPage.addJsonKey(keyName, keyTTL, jsonValue);
        const command = `JSON.GET ${keyName}`;
        //Open CLI and run command
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, command);
        await t.pressKey('enter');
        //Verify result
        //const commandResult = jsonValue.replace(/"/g, '\\"');
        await t.expect(cliPage.cliOutputResponseSuccess.innerText).eql(jsonValueCli, 'The user can see JSON object with escaped quotes');
});
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can see DB endpoint in the header of CLI', async t => {
        const databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}`;
        //Open CLI and check endpoint
        await t.click(cliPage.cliExpandButton);
        await t.expect(cliPage.cliEndpoint.textContent).eql(databaseEndpoint, 'The user can see DB endpoint in the header of CLI');
});
