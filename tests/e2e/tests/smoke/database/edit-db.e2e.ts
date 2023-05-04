import { ClientFunction } from 'testcafe';
import { acceptLicenseTerms, deleteDatabase, addNewStandaloneDatabase, addNewREClusterDatabase, addNewRECloudDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, UserAgreementPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig,
    redisEnterpriseClusterConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();

fixture `Edit Databases`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    });
// Returns the URL of the current web page
const getPageUrl = ClientFunction(() => window.location.href);
test
    .meta({ rte: rte.reCluster })
    .after(async() => {
        // Delete database
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can connect to the RE cluster database', async t => {
        await addNewREClusterDatabase(redisEnterpriseClusterConfig);
        await myRedisDatabasePage.clickOnDBByName(redisEnterpriseClusterConfig.databaseName);
        await t.expect(getPageUrl()).contains('browser', 'The edit view is not opened');
    });
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        // Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })('Verify that user open edit view of database', async t => {
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(myRedisDatabasePage.AddRedisDatabase.addDatabaseButton.exists).ok('The add redis database view not found', { timeout: 10000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.expect(getPageUrl()).contains('browser', 'Browser page not opened');
    });
// skiped until the RE Cloud connection is implemented
test.skip
    .meta({ rte: rte.reCloud })('Verify that user can connect to the RE Cloud database', async t => {
    // TODO: add api keys from env
        const databaseName = await addNewRECloudDatabase('', '');
        await myRedisDatabasePage.clickOnDBByName(databaseName);
        await t.expect(getPageUrl()).contains('browser', 'The edit view is not opened');
    });
