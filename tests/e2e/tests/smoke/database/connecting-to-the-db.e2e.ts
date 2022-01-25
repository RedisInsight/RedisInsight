import { ClientFunction } from 'testcafe';
import { acceptLicenseTerms, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossClusterConfig,
    ossSentinelConfig
} from '../../../helpers/conf';
import { discoverSentinelDatabase, addOSSClusterDatabase } from '../../../helpers/database';

const myRedisDatabasePage = new MyRedisDatabasePage();

const getPageUrl = ClientFunction(() => window.location.href);

fixture `Connecting to the databases verifications`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTerms();
    })
test
    .after(async () => {
        //Delete database
        await myRedisDatabasePage.deleteDatabaseByName('primary-group-1');
        await myRedisDatabasePage.deleteDatabaseByName('primary-group-2');
    })
    ('Verify that user can connect to Sentinel DB', async t => {
        //Add OSS Sentinel DB
        await discoverSentinelDatabase(ossSentinelConfig);
        //Get groups & their count
        const sentinelGroups = myRedisDatabasePage.dbNameList;
        const sentinelGroupsCount = await sentinelGroups.count;
        //Verify all groups for connection
        for (let i = 0; i < sentinelGroupsCount; i++) {
            const groupSelector = sentinelGroups.nth(i);
            //Connect to DB
            await myRedisDatabasePage.clickOnDBByName(await groupSelector.textContent);
            //Check that browser page was opened
            await t.expect(getPageUrl()).contains('browser');
            //Go to databases list
            await t.click(myRedisDatabasePage.myRedisDBButton);
        }
    });
test
    .after(async () => {
        await deleteDatabase(ossClusterConfig.ossClusterDatabaseName);
    })
    ('Verify that user can connect to OSS Cluster DB', async t => {
        //Add OSS Cluster DB
        await addOSSClusterDatabase(ossClusterConfig);
        await myRedisDatabasePage.clickOnDBByName(ossClusterConfig.ossClusterDatabaseName);
        //Check that browser page was opened
        await t.expect(getPageUrl()).contains('browser');
    });
