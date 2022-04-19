import { env, rte } from '../../../helpers/constants';
import { acceptTermsAddDatabaseOrConnectToRedisStack, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const cliPage = new CliPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });

fixture `CLI`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptTermsAddDatabaseOrConnectToRedisStack(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can add data via CLI', async t => {
        keyName = chance.word({ length: 10 });
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Add key from CLI
        await t.typeText(cliPage.cliCommandInput, `SADD ${keyName} "chinese" "japanese" "german"`);
        await t.pressKey('enter');
        //Check that the key is added
        await browserPage.searchByKeyName(keyName);
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('The key is added');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can expand CLI', async t => {
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Check that CLI is opened
        await t.expect(cliPage.cliArea.exists).ok('CLI area is displayed');
        await t.expect(cliPage.cliCommandInput.exists).ok('CLI input is displayed')
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can collapse CLI', async t => {
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Check that CLI is opened
        await t.expect(cliPage.cliArea.visible).ok('CLI area is displayed');
        //Collaple CLI
        await t.click(cliPage.cliCollapseButton);
        //Check that CLI is closed
        await t.expect(cliPage.cliArea.visible).notOk('CLI area should not be displayed');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can use blocking command', async t => {
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Type blocking command
        await t.typeText(cliPage.cliCommandInput, 'blpop newKey 10000');
        await t.pressKey('enter');
        //Verify that user input is blocked
        await t.expect(cliPage.cliCommandInput.exists).notOk('Cli input is not shown');
    });
test
    .meta({ env: env.web, rte: rte.standalone })
    ('Verify that user can use unblocking command', async t => {
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Get clientId
        await t.typeText(cliPage.cliCommandInput, 'client id');
        await t.pressKey('enter');
        const clientId = (await cliPage.cliOutputResponseSuccess.textContent).replace(/^\D+/g, '');
        //Type blocking command
        await t.typeText(cliPage.cliCommandInput, 'blpop newKey 10000');
        await t.pressKey('enter');
        //Verify that user input is blocked
        await t.expect(cliPage.cliCommandInput.exists).notOk('Cli input is not shown');
        //Create new window to unblock the client
        await t
            .openWindow(commonUrl)
            .maximizeWindow();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Unblock client
        await t.typeText(cliPage.cliCommandInput, `client unblock ${clientId}`);
        await t.pressKey('enter');
        await t.closeWindow();
        await t.expect(cliPage.cliCommandInput.exists).ok('Cli input is shown, the client was unblocked', { timeout: 20000 });
    });
