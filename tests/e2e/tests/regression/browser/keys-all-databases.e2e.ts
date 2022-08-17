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
    commonUrl,
    ossClusterConfig,
    ossSentinelConfig,
    redisEnterpriseClusterConfig
} from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { deleteOSSClusterDatabaseApi, deleteSentinelDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const common = new Common();

let keyName = common.generateWord(10);

fixture `Work with keys in all types of databases`
    .meta({ type: 'regression' })
    .page(commonUrl);
test
    .meta({ rte: rte.reCluster })
    .before(async() => {
        await acceptLicenseTermsAndAddREClusterDatabase(redisEnterpriseClusterConfig);
    })
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add Key in RE Cluster DB', async t => {
        keyName = common.generateWord(10);
        //add Hash key
        await browserPage.addHashKey(keyName);
        //check the notification message
        const notification = await browserPage.getMessageText();
        await t.expect(notification).contains('Key has been added', 'The notification');
        //check that new key is displayed in the list
        await browserPage.searchByKeyName(keyName);
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('The key is added');
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig);
    })
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that user can add Key in RE Cloud DB', async t => {
        keyName = common.generateWord(10);
        //add Hash key
        await browserPage.addHashKey(keyName);
        //check the notification message
        const notification = await browserPage.getMessageText();
        await t.expect(notification).contains('Key has been added', 'The notification');
        //check that new key is displayed in the list
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
    })('Verify that user can add Key in OSS Cluster DB', async t => {
        keyName = common.generateWord(10);
        //add Hash key
        await browserPage.addHashKey(keyName);
        //check the notification message
        const notification = await browserPage.getMessageText();
        await t.expect(notification).contains('Key has been added', 'The notification');
        //check that new key is displayed in the list
        await browserPage.searchByKeyName(keyName);
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('The key is added');
    });
test
    .meta({ env: env.web, rte: rte.sentinel })
    .before(async() => {
        await acceptLicenseTermsAndAddSentinelDatabaseApi(ossSentinelConfig);
    })
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteSentinelDatabaseApi(ossSentinelConfig);
    })('Verify that user can add Key in Sentinel Primary Group', async t => {
        keyName = common.generateWord(10);
        //add Hash key
        await browserPage.addHashKey(keyName);
        //check the notification message
        const notification = await browserPage.getMessageText();
        await t.expect(notification).contains('Key has been added', 'The notification');
        //check that new key is displayed in the list
        await browserPage.searchByKeyName(keyName);
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('The key is added');
    });
