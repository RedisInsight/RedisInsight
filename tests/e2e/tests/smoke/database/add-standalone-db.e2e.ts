import { addNewStandaloneDatabase, addNewREClusterDatabase, addNewRECloudDatabase, addOSSClusterDatabase, acceptLicenseTerms, deleteDatabase } from '../../../helpers/database';
import {
    commonUrl,
    ossStandaloneConfig,
    ossClusterConfig,
    redisEnterpriseClusterConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { Selector, t } from 'testcafe';
import { BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';

const browserPage = new BrowserPage()

fixture`Add database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTerms();
    });
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })('Verify that user can add Standalone Database', async () => {
        const myRedisDatabasePage = new MyRedisDatabasePage();
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await browserPage.verifyDatabaseStatusIsVisible();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.click(browserPage.myRedisDbIcon);
        await browserPage.verifyDatabaseStatusIsVisible();
    });
test
    .meta({ rte: rte.reCluster })
    .after(async () => {
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add database from RE Cluster via auto-discover flow', async () => {
        await addNewREClusterDatabase(redisEnterpriseClusterConfig);
        await browserPage.verifyDatabaseStatusIsVisible();
    });
test
    .meta({ env: env.web, rte: rte.ossCluster })
    .after(async () => {
        await deleteDatabase(ossClusterConfig.ossClusterDatabaseName);
    })('Verify that user can add OSS Cluster DB', async () => {
        await addOSSClusterDatabase(ossClusterConfig);
        await browserPage.verifyDatabaseStatusIsVisible();
    });
//skiped until the RE Cloud connection is implemented
test.skip
    .meta({ rte: rte.reCloud })('Verify that user can add database from RE Cloud via auto-discover flow', async () => {
        //TODO: add api keys from env
        await addNewRECloudDatabase('', '');
    });
