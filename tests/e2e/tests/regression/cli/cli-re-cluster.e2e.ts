import { env, rte } from '../../../helpers/constants';
import {
    acceptLicenseTermsAndAddOSSClusterDatabase,
    acceptLicenseTermsAndAddRECloudDatabase,
    acceptLicenseTermsAndAddREClusterDatabase,
    acceptLicenseTermsAndAddSentinelDatabaseApi,
    deleteDatabase
} from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import {
    cloudDatabaseConfig,
    commonUrl, ossClusterConfig,
    ossSentinelConfig,
    redisEnterpriseClusterConfig
} from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { deleteOSSClusterDatabaseApi, deleteSentinelDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const common = new Common();

let keyName = common.generateWord(10);

fixture `Work with CLI in all types of databases`
    .meta({ type: 'regression' })
    .page(commonUrl);
test
    .meta({ rte: rte.reCluster })
    .before(async() => {
        await acceptLicenseTermsAndAddREClusterDatabase(redisEnterpriseClusterConfig, redisEnterpriseClusterConfig.databaseName);
    })
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add data via CLI in RE Cluster DB', async t => {
        keyName = common.generateWord(10);
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
    .meta({ rte: rte.reCloud })
    .before(async() => {
        await acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig, cloudDatabaseConfig.databaseName);
    })
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that user can add data via CLI in RE Cloud DB', async t => {
        keyName = common.generateWord(10);
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
    .meta({ rte: rte.ossCluster })
    .before(async() => {
        await acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig, ossClusterConfig.ossClusterDatabaseName);
    })
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
    })('Verify that user can add data via CLI in OSS Cluster DB', async t => {
        keyName = common.generateWord(10);
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
    .meta({ env: env.web, rte: rte.sentinel })
    .before(async() => {
        await acceptLicenseTermsAndAddSentinelDatabaseApi(ossSentinelConfig, ossSentinelConfig.masters[1].alias);
    })
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteSentinelDatabaseApi(ossSentinelConfig);
    })('Verify that user can add data via CLI in Sentinel Primary Group', async t => {
        keyName = common.generateWord(10);
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
