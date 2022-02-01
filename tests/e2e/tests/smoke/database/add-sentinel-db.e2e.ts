import { discoverSentinelDatabase } from '../../../helpers/database';
import { commonUrl, ossSentinelConfig } from '../../../helpers/conf';
import { MyRedisDatabasePage, UserAgreementPage, AddRedisDatabasePage } from '../../../pageObjects';

const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Add DBs from Sentinel`
    .page(commonUrl)
    .meta({ type: 'smoke'})
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await myRedisDatabasePage.deleteAllDatabases();
    })
test
    .meta({ env: 'web', rte: 'standalone' })
    ('Verify that user can add Sentinel DB', async t => {
        await discoverSentinelDatabase(ossSentinelConfig);
        await t.expect(myRedisDatabasePage.hostPort.textContent).eql(`${ossSentinelConfig.sentinelHost}:${ossSentinelConfig.sentinelPort}`, 'The sentinel database is in the list');
    });
