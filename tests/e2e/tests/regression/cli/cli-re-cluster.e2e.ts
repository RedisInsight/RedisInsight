import { Selector, t } from 'testcafe';
import { env, rte } from '../../../helpers/constants';
import {
    acceptLicenseTermsAndAddOSSClusterDatabase,
    acceptLicenseTermsAndAddRECloudDatabase,
    acceptLicenseTermsAndAddREClusterDatabase,
    acceptLicenseTermsAndAddSentinelDatabaseApi,
    deleteDatabase
} from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    cloudDatabaseConfig,
    commonUrl, ossClusterConfig,
    ossSentinelConfig,
    redisEnterpriseClusterConfig
} from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { deleteOSSClusterDatabaseApi, deleteAllDatabasesByConnectionTypeApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();

let keyName = Common.generateWord(10);
const verifyCommandsInCli = async(): Promise<void> => {
    keyName = Common.generateWord(10);
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Add key from CLI
    await t.typeText(browserPage.Cli.cliCommandInput, `SADD ${keyName} "chinese" "japanese" "german"`, { replace: true, paste: true });
    await t.pressKey('enter');
    // Check that the key is added
    await browserPage.searchByKeyName(keyName);
    const keyNameInTheList = Selector(`[data-testid="key-${keyName}"]`);
    await Common.waitForElementNotVisible(browserPage.loader);
    await t.expect(keyNameInTheList.exists).ok(`${keyName} key is not added`);
};

fixture `Work with CLI in all types of databases`
    .meta({ type: 'regression' })
    .page(commonUrl);
test
    .meta({ rte: rte.reCluster })
    .before(async() => {
        await acceptLicenseTermsAndAddREClusterDatabase(redisEnterpriseClusterConfig);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add data via CLI in RE Cluster DB', async() => {
        // Verify that database index switcher not displayed for RE Cluster
        await t.expect(browserPage.OverviewPanel.changeIndexBtn.exists).notOk('Change Db index control displayed for RE Cluster DB');

        await verifyCommandsInCli();
    });
test
    .meta({ rte: rte.reCloud })
    .before(async() => {
        await acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that user can add data via CLI in RE Cloud DB', async() => {
        // Verify that database index switcher not displayed for RE Cloud
        await t.expect(browserPage.OverviewPanel.changeIndexBtn.exists).notOk('Change Db index control displayed for RE Cloud DB');

        await verifyCommandsInCli();
    });
test
    .meta({ rte: rte.ossCluster })
    .before(async() => {
        await acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig, ossClusterConfig.ossClusterDatabaseName);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
    })('Verify that user can add data via CLI in OSS Cluster DB', async() => {
        // Verify that database index switcher not displayed for RE Cloud
        await t.expect(browserPage.OverviewPanel.changeIndexBtn.exists).notOk('Change Db index control displayed for OSS Cluster DB');

        await verifyCommandsInCli();
    });
test
    .meta({ env: env.web, rte: rte.sentinel })
    .before(async() => {
        await acceptLicenseTermsAndAddSentinelDatabaseApi(ossSentinelConfig);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteAllDatabasesByConnectionTypeApi('SENTINEL');
    })('Verify that user can add data via CLI in Sentinel Primary Group', async() => {
        // Verify that database index switcher displayed for Sentinel
        await t.expect(browserPage.OverviewPanel.changeIndexBtn.exists).ok('Change Db index control not displayed for Sentinel DB');

        await verifyCommandsInCli();
    });
