import { t } from 'testcafe';
import { DatabaseHelper } from '../../../../helpers/database';
import {
    commonUrl,
    redisEnterpriseClusterConfig,
    cloudDatabaseConfig
} from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { AutoDiscoverREDatabases, MyRedisDatabasePage } from '../../../../pageObjects';

const myRedisDatabasePage = new MyRedisDatabasePage();
const autoDiscoverREDatabases = new AutoDiscoverREDatabases();
const databaseHelper = new DatabaseHelper();

fixture `Add database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
test
    .meta({ rte: rte.reCluster })
    .after(async() => {
        await databaseHelper.deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add database from RE Cluster via auto-discover flow', async() => {
        await databaseHelper.addNewREClusterDatabase(redisEnterpriseClusterConfig);
        // Verify that user can see an indicator of databases that are added using autodiscovery and not opened yet
        // Verify new connection badge for RE cluster
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(redisEnterpriseClusterConfig.databaseName);
    });
test
    .meta({ rte: rte.reCloud })
    .after(async() => {
        await databaseHelper.deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that user can add database from RE Cloud', async() => {
        await databaseHelper.addRECloudDatabase(cloudDatabaseConfig);
        // Verify new connection badge for RE cloud
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(cloudDatabaseConfig.databaseName);
        // Verify redis stack icon for RE Cloud with all 5 modules
        await t.expect(myRedisDatabasePage.redisStackIcon.visible).ok('Redis Stack icon not found for RE Cloud db with all 5 modules');
    });
test
    .meta({ rte: rte.reCloud })('Verify that user can add a subscription via auto-discover flow', async t => {
        await myRedisDatabasePage.AddRedisDatabase.addAutodiscoverRECloudDatabase(
            cloudDatabaseConfig.accessKey,
            cloudDatabaseConfig.secretKey
        );
        await t.click(
            myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
        await t.expect(autoDiscoverREDatabases.title.withExactText('Redis Cloud Subscriptions').exists)
            .ok('Subscriptions list not displayed', { timeout: 120000 });
        // Select subscriptions
        await t.click(myRedisDatabasePage.AddRedisDatabase.selectAllCheckbox);
        await t.click(myRedisDatabasePage.AddRedisDatabase.showDatabasesButton);
        await t.expect(autoDiscoverREDatabases.title.withExactText('Redis Cloud Databases').exists)
            .ok('database page is not displayed', { timeout: 120000 });
    });
