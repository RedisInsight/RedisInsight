import { ClientFunction } from 'testcafe';
import { acceptLicenseTerms, deleteDatabase, discoverSentinelDatabase, addOSSClusterDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossClusterConfig,
    ossSentinelConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();

const getPageUrl = ClientFunction(() => window.location.href);

fixture `Connecting to the databases verifications`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    });
test
    .meta({ env: env.web, rte: rte.sentinel })
    .after(async() => {
        // Delete database
        await myRedisDatabasePage.deleteDatabaseByName(ossSentinelConfig.masters[0].name);
        await myRedisDatabasePage.deleteDatabaseByName(ossSentinelConfig.masters[1].name);
    })('Verify that user can connect to Sentinel DB', async t => {
        // Add OSS Sentinel DB
        await discoverSentinelDatabase(ossSentinelConfig);

        // Get groups & their count
        const sentinelGroups = myRedisDatabasePage.dbNameList.withText('primary-group');
        const sentinelGroupsCount = await sentinelGroups.count;

        // Verify new connection badge for Sentinel db
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossSentinelConfig.masters[0].name);
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossSentinelConfig.masters[1].name);

        // Verify all groups for connection
        for (let i = 0; i < sentinelGroupsCount; i++) {
            const groupSelector = sentinelGroups.nth(i);
            // Connect to DB
            await myRedisDatabasePage.clickOnDBByName(await groupSelector.textContent);
            // Check that browser page was opened
            await t.expect(getPageUrl()).contains('browser', 'Browser page not opened');
            // Go to databases list
            await t.click(myRedisDatabasePage.myRedisDBButton);
        }
    });
test
    .meta({ env: env.web, rte: rte.ossCluster })
    .after(async() => {
        await deleteDatabase(ossClusterConfig.ossClusterDatabaseName);
    })('Verify that user can connect to OSS Cluster DB', async t => {
        // Add OSS Cluster DB
        await addOSSClusterDatabase(ossClusterConfig);
        await myRedisDatabasePage.clickOnDBByName(ossClusterConfig.ossClusterDatabaseName);
        // Check that browser page was opened
        await t.expect(getPageUrl()).contains('browser', 'Browser page not opened');
    });
