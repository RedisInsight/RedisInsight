import { addNewStandaloneDatabase, addNewREClusterDatabase, addNewRECloudDatabase, addOSSClusterDatabase } from '../../../helpers/database';
import { UserAgreementPage, AddRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig,
    ossClusterConfig,
    redisEnterpriseClusterConfig
} from '../../../helpers/conf';

const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `Add database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
    })
test
    .meta({ rte: 'standalone' })
    ('Verify that user can add Standalone Database', async() => {
        await addNewStandaloneDatabase(ossStandaloneConfig);
    });
test
    .meta({ rte: 're-cluster' })
    ('Verify that user can add database from RE Cluster via auto-discover flow', async() => {
        await addNewREClusterDatabase(redisEnterpriseClusterConfig);
    });
test
    .meta({ env: 'web', rte: 'oss-cluster'})
    ('Verify that user can add OSS Cluster DB', async() => {
        await addOSSClusterDatabase(ossClusterConfig);
    });
//skiped until the RE Cloud connection is implemented
test.skip
    .meta({ rte: 're-cloud' })
    ('Verify that user can add database from RE Cloud via auto-discover flow', async() => {
        //TODO: add api keys from env
        await addNewRECloudDatabase('', '');
    });
