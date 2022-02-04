import { addNewStandaloneDatabase, addNewREClusterDatabase, addNewRECloudDatabase, addOSSClusterDatabase } from '../../../helpers/database';
import { acceptLicenseTerms, deleteDatabase } from '../../../helpers/database';
import {
    commonUrl,
    ossStandaloneConfig,
    ossClusterConfig,
    redisEnterpriseClusterConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';

fixture `Add database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTerms();
    })
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can add Standalone Database', async() => {
        await addNewStandaloneDatabase(ossStandaloneConfig);
    });
test
    .meta({ rte: rte.reCluster })
    .after(async () => {
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })
    ('Verify that user can add database from RE Cluster via auto-discover flow', async() => {
        await addNewREClusterDatabase(redisEnterpriseClusterConfig);
    });
test
    .meta({ env: env.web, rte: rte.ossCluster})
    .after(async () => {
        await deleteDatabase(ossClusterConfig.ossClusterDatabaseName);
    })
    ('Verify that user can add OSS Cluster DB', async() => {
        await addOSSClusterDatabase(ossClusterConfig);
    });
//skiped until the RE Cloud connection is implemented
test.skip
    .meta({ rte: rte.reCloud })
    ('Verify that user can add database from RE Cloud via auto-discover flow', async() => {
        //TODO: add api keys from env
        await addNewRECloudDatabase('', '');
    });
