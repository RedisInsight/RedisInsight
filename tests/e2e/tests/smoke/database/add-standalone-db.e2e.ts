import { t } from 'testcafe';
import {
    addNewStandaloneDatabase,
    addNewREClusterDatabase,
    addOSSClusterDatabase,
    acceptLicenseTerms,
    deleteDatabase,
    addRECloudDatabase
} from '../../../helpers/database';
import {
    commonUrl,
    ossStandaloneConfig,
    ossClusterConfig,
    redisEnterpriseClusterConfig,
    cloudDatabaseConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';

const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Add database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    });
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })('Verify that user can add Standalone Database', async() => {
        await addNewStandaloneDatabase(ossStandaloneConfig);
        // Verify that user can see an indicator of databases that are added manually and not opened yet
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.click(browserPage.myRedisDbIcon);
        // Verify that user can't see an indicator of databases that were opened
        await myRedisDatabasePage.verifyDatabaseStatusIsNotVisible();
    });
test
    .meta({ rte: rte.reCluster })
    .after(async() => {
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add database from RE Cluster via auto-discover flow', async() => {
        await addNewREClusterDatabase(redisEnterpriseClusterConfig);
        // Verify that user can see an indicator of databases that are added using autodiscovery and not opened yet
        // Verify new connection badge for RE cluster
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible();
    });
test
    .meta({ env: env.web, rte: rte.ossCluster })
    .after(async() => {
        await deleteDatabase(ossClusterConfig.ossClusterDatabaseName);
    })('Verify that user can add OSS Cluster DB', async() => {
        await addOSSClusterDatabase(ossClusterConfig);
        // Verify new connection badge for OSS cluster
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible();
    });

test
    .meta({ rte: rte.reCloud })
    .after(async() => {
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that user can add database from RE Cloud via auto-discover flow', async() => {
        await addRECloudDatabase(cloudDatabaseConfig);
        // Verify new connection badge for RE cloud
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible();
        // Verify redis stack icon for RE Cloud with all 5 modules
        await t.expect(myRedisDatabasePage.redisStackIcon.visible).ok('Redis Stack icon not found for RE Cloud db with all 5 modules');
    });
