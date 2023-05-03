import { acceptLicenseTerms, deleteCustomDatabase } from '../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();

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
        await acceptLicenseTerms();
    })
    .afterEach(async() => {
        // Delete database
        await deleteCustomDatabase(`${ossStandaloneConfig.databaseName} [${index}]`);
    });
test
    .after(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
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
        await t.expect(browserPage.Cli.cliEndpoint.textContent).eql(databaseEndpoint, 'Database index 0 is not displayed in the CLI endpoint');
    });
test('Verify that working with logical DBs, user can see N DB index in CLI', async t => {
    index = '1';
    databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}[db${index}]`;

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
    await t.expect(browserPage.Cli.cliEndpoint.textContent).eql(databaseEndpoint, 'Database index is not displayed in the CLI endpoint');
});
test('Verify that user can see DB index in the endpoint in CLI header is automatically changed when switched to another logical DB', async t => {
    index = '2';
    const indexAfter = '3';
    databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}[db${index}]`;
    const databaseEndpointAfter = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}[db${indexAfter}]`;

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

    // Open CLI and verify the database index in the endpoint
    await t.expect(browserPage.Cli.cliEndpoint.textContent).eql(databaseEndpoint, `The endpoint in CLI header not contains ${index} index`);
    // Minimize and maximize CLI
    await t.click(browserPage.Cli.minimizeCliButton);
    await t.click(browserPage.Cli.cliExpandButton);
    // Verify that user can work with selected logical DB in CLI when he minimazes and then maximizes the CLI
    await t.expect(browserPage.Cli.cliEndpoint.textContent).eql(databaseEndpoint, `The endpoint in CLI header not contains ${index} index after minimize`);

    // Open CLI and verify the database index in the endpoint
    await t.expect(browserPage.Cli.cliEndpoint.textContent).eql(databaseEndpoint, `The endpoint in CLI header not contains ${index} index`);
    // Switch to another logical database and check endpoint
    await t.typeText(browserPage.Cli.cliCommandInput, `Select ${indexAfter}`, { paste: true });
    await t.pressKey('enter');
    await t.expect(browserPage.Cli.cliEndpoint.textContent).eql(databaseEndpointAfter, `The endpoint in CLI header is not automatically changed to the new ${indexAfter}`);
});
