import { acceptLicenseTerms } from '../../../helpers/database';
import { discoverSentinelDatabase } from '../../../helpers/database';
import { commonUrl, ossSentinelConfig } from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../pageObjects';

const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Add DBs from Sentinel`
    .page(commonUrl)
    .meta({ type: 'smoke'})
    .beforeEach(async () => {
        await acceptLicenseTerms();
    })
    .afterEach(async t => {
        //Delete database
        await myRedisDatabasePage.deleteDatabaseByName('primary-group-1');
        await myRedisDatabasePage.deleteDatabaseByName('primary-group-2');
    })
test
    .meta({ env: env.web, rte: rte.standalone })
    ('Verify that user can add Sentinel DB', async t => {
        await discoverSentinelDatabase(ossSentinelConfig);
        await t.expect(myRedisDatabasePage.hostPort.textContent).eql(`${ossSentinelConfig.sentinelHost}:${ossSentinelConfig.sentinelPort}`, 'The sentinel database is in the list');
    });
