import { acceptLicenseTerms, deleteDatabase } from '../../../helpers/database';
import { CliPage, AddRedisDatabasePage, MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const cliPage = new CliPage();
const addRedisDatabasePage =  new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();

let index = '0';
let databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}`;
const cliMessage = [
    'Pinging Redis server on ',
    databaseEndpoint,
    'Connected.',
    'Ready to execute commands.'
];

fixture `CLI logical database`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTerms();
    })
    .afterEach(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName + ` [${index}]`);
    })
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that working with logical DBs, user can not see 0 DB index in CLI', async t => {
        await addRedisDatabasePage.addLogicalRedisDatabase(ossStandaloneConfig, index);
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
    ('Verify that working with logical DBs, user can see N DB index in CLI', async t => {
        index = '1';
        databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}[${index}]`;
        await addRedisDatabasePage.addLogicalRedisDatabase(ossStandaloneConfig, index);
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
    ('Verify that when user re-creates client in CLI the new client is connected to the DB index selected for the DB by default', async t => {
        index = '2';
        databaseEndpoint = `${ossStandaloneConfig.host}:${ossStandaloneConfig.port}[${index}]`;
        await addRedisDatabasePage.addLogicalRedisDatabase(ossStandaloneConfig, index);
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
