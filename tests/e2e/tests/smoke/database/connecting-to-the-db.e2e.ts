import { ClientFunction } from 'testcafe';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossClusterConfig,
    ossSentinelConfig
} from '../../../helpers/conf';
import { discoverSentinelDatabase, addOSSClusterDatabase } from '../../../helpers/database';

const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();

const getPageUrl = ClientFunction(() => window.location.href);

fixture `Connecting to the databases verifications`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await myRedisDatabasePage.deleteAllDatabases();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
    })
test('Verify that user can connect to Sentinel DB', async t => {
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
test('Verify that user can connect to OSS Cluster DB', async t => {
    //Add OSS Cluster DB
    await addOSSClusterDatabase(ossClusterConfig);
    await myRedisDatabasePage.clickOnDBByName(ossClusterConfig.ossClusterDatabaseName);
    //Check that browser page was opened
    await t.expect(getPageUrl()).contains('browser');
});
