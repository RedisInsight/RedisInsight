import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let index = '0';
let databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}`;
const cliMessage = [
    'Pinging Redis server on ',
    databaseEndpoint,
    'Connected.',
    'Ready to execute commands.'
];

fixture `CLI logical database`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    })
    .afterEach(async() => {
        // Delete database
        await databaseHelper.deleteCustomDatabase(`${ossStandaloneConfig.databaseName} [${index}]`);
    });
test
    .after(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that working with logical DBs, user can not see 0 DB index in CLI', async t => {
        await myRedisDatabasePage.AddRedisDatabase.addLogicalRedisDatabase(ossStandaloneConfig, index);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        // Open CLI
        await t.click(browserPage.Cli.cliExpandButton);
        // Verify that user can not see 0 DB index in CLI
        for (const text of cliMessage) {
            await t.expect(browserPage.Cli.cliArea.textContent).contains(text, 'No DB index is not displayed in the CLI message');
        }
        await t.expect(browserPage.Cli.cliDbIndex.visible).eql(false, 'No DB index before the > character in CLI is not displayed');
    });
test('Verify that working with logical DBs, user can see N DB index in CLI', async t => {
    index = '1';

    await myRedisDatabasePage.AddRedisDatabase.addLogicalRedisDatabase(ossStandaloneConfig, index);
    await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneConfig.databaseName  } [db${index}]`);
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Verify that user can see DB index in CLI
    // Verify that user can see the db{index} instead of {index} in CLI input and endpoint
    for (const text of cliMessage) {
        await t.expect(browserPage.Cli.cliArea.textContent).contains(text, 'DB index is not displayed in the CLI message');
    }
    await t.expect(browserPage.Cli.cliDbIndex.textContent).eql(`[db${index}] `, 'DB index before the > character in CLI is not displayed');
});
test('Verify that user can see DB index in the endpoint in CLI header is automatically changed when switched to another logical DB', async t => {
    index = '2';
    const indexAfter = '3';

    await myRedisDatabasePage.AddRedisDatabase.addLogicalRedisDatabase(ossStandaloneConfig, index);
    await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneConfig.databaseName  } [db${index}]`);

    // Open CLI and verify that user can see DB index in CLI
    await t.click(browserPage.Cli.cliExpandButton);
    await t.expect(browserPage.Cli.cliDbIndex.textContent).eql(`[db${index}] `, 'DB index before the > character in CLI is not displayed');
    // Re-creates client in CLI
    await t.click(browserPage.Cli.cliCollapseButton);
    await t.click(browserPage.Cli.cliExpandButton);
    // Verify that when user re-creates client in CLI the new client is connected to the DB index selected for the DB by default
    await t.expect(browserPage.Cli.cliDbIndex.textContent).eql(`[db${index}] `, 'The new client is not connected to the DB index selected for the DB by default');

    // Switch to another logical database and check endpoint
    await t.typeText(browserPage.Cli.cliCommandInput, `Select ${indexAfter}`, { paste: true });
    await t.pressKey('enter');
    await t.expect(browserPage.Cli.cliDbIndex.textContent).eql(`[db${indexAfter}] `, `Db index is not automatically changed to the new ${indexAfter}`);
});
