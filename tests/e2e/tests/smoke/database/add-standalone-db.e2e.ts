import { t } from 'testcafe';
import {
    addNewStandaloneDatabase,
    addNewREClusterDatabase,
    addOSSClusterDatabase,
    acceptLicenseTerms,
    deleteDatabase,
    acceptLicenseTermsAndAddRECloudDatabase
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
        await browserPage.verifyDatabaseStatusIsVisible();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.click(browserPage.myRedisDbIcon);
        // New connections indicator
        await browserPage.verifyDatabaseStatusIsNotVisible();
    });
test
    .meta({ rte: rte.reCluster })
    .after(async() => {
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add database from RE Cluster via auto-discover flow', async() => {
        // New connections indicator
        await addNewREClusterDatabase(redisEnterpriseClusterConfig);
        await browserPage.verifyDatabaseStatusIsVisible();
    });
test
    .meta({ env: env.web, rte: rte.ossCluster })
    .after(async() => {
        await deleteDatabase(ossClusterConfig.ossClusterDatabaseName);
    })('Verify that user can add OSS Cluster DB', async() => {
        // New connections indicator
        await addOSSClusterDatabase(ossClusterConfig);
        await browserPage.verifyDatabaseStatusIsVisible();
    });

test
    .meta({ rte: rte.reCloud })('Verify that user can add database from RE Cloud via auto-discover flow', async() => {
        // New connections indicator
        await acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig);
        await browserPage.verifyDatabaseStatusIsVisible();
    });
