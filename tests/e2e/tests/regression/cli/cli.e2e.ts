import { acceptLicenseTerms, acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import { BrowserPage, CliPage, AddRedisDatabasePage, MyRedisDatabasePage } from '../../../pageObjects';
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
const addRedisDatabasePage =  new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();

let keyName = chance.word({ length: 20 });
let index = '0';
let databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}`;
const cliMessage = [
    'Pinging Redis server on ',
    databaseEndpoint,
    'Connected.',
    'Ready to execute commands.'
];

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
        chance.word({ length: 20 });
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
    .before(async () => {
        await acceptLicenseTerms();
    })
    ('Verify that working with logical DBs, user can not see 0 DB index in CLI', async t => {
        await addRedisDatabasePage.addRedisDataBase(ossStandaloneConfig);
        //Enter logical index
        await t.click(addRedisDatabasePage.databaseIndexCheckbox);
        await t.typeText(addRedisDatabasePage.databaseIndexInput, index, { paste: true });
        //Click for saving
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Verify that user can not see 0 DB index in CLI
        for ( const text of cliMessage ) {
            await t.expect(cliPage.cliArea.textContent).contains(text, 'No DB index is displayed in the CLI message');
        }
        await t.expect(cliPage.cliDbIndex.visible).eql(false, 'No DB index before the > character in CLI is displayed');
        await t.expect(cliPage.cliEndpoint.textContent).eql(databaseEndpoint, 'Database index 0 is not displayed in the CLI endpoint');
});
test
    .meta({ rte: rte.standalone })
    .before(async () => {
        await acceptLicenseTerms();
    })
    .after(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName + ` [${index}]`);
    })
    ('Verify that working with logical DBs, user can see N DB index in CLI', async t => {
        index = '1';
        databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}[${index}]`;
        await addRedisDatabasePage.addRedisDataBase(ossStandaloneConfig);
        //Enter logical index
        await t.click(addRedisDatabasePage.databaseIndexCheckbox);
        await t.typeText(addRedisDatabasePage.databaseIndexInput, index, { paste: true });
        //Click for saving
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName + ` [${index}]`);
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Verify that user can see DB index in CLI
        for ( const text of cliMessage ) {
            await t.expect(cliPage.cliArea.textContent).contains(text, 'DB index is displayed in the CLI message');
        }
        await t.expect(cliPage.cliDbIndex.textContent).eql(`[${index}] `, 'DB index before the > character in CLI is displayed');
        await t.expect(cliPage.cliEndpoint.textContent).eql(databaseEndpoint, 'Database index is displayed in the CLI endpoint');
});
test
    .meta({ rte: rte.standalone })
    .before(async () => {
        await acceptLicenseTerms();
    })
    .after(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName + ` [${index}]`);
    })
    ('Verify that when user re-creates client in CLI the new client is connected to the DB index selected for the DB by default', async t => {
        index = '2';
        databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}[${index}]`;
        await addRedisDatabasePage.addRedisDataBase(ossStandaloneConfig);
        //Enter logical index
        await t.click(addRedisDatabasePage.databaseIndexCheckbox);
        await t.typeText(addRedisDatabasePage.databaseIndexInput, index, { paste: true });
        //Click for saving
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName + ` [${index}]`);
        //Open CLI and verify that user can see DB index in CLI
        await t.click(cliPage.cliExpandButton);
        await t.expect(cliPage.cliDbIndex.textContent).eql(`[${index}] `, 'DB index before the > character in CLI is displayed');
        //Re-creates client in CLI
        await t.click(cliPage.cliCollapseButton);
        await t.click(cliPage.cliExpandButton);
        //Verify that the new client is connected to the DB index selected for the DB by default
        await t.expect(cliPage.cliDbIndex.textContent).eql(`[${index}] `, 'The new client is connected to the DB index selected for the DB by default');
});
