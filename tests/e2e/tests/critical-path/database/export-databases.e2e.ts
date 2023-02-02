import * as fs from 'fs';
import * as os from 'os';
import { join as joinPath } from 'path';
import { rte } from '../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossClusterConfig, ossSentinelConfig, ossStandaloneConfig } from '../../../helpers/conf';
import { acceptLicenseTerms } from '../../../helpers/database';
import {
    addNewOSSClusterDatabaseApi,
    addNewStandaloneDatabaseApi,
    deleteAllSentinelDatabasesApi,
    deleteOSSClusterDatabaseApi,
    deleteStandaloneDatabaseApi,
    discoverSentinelDatabaseApi
} from '../../../helpers/api/api-database';
import { DatabasesActions } from '../../../common-actions/databases-actions';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databasesActions = new DatabasesActions();
const common = new Common();

async function getFileDownloadPath(): Promise<string> {
    return joinPath(os.homedir(), 'Downloads');
}

async function findFileByFileStarts(dir: string): Promise<string> {
    if (fs.existsSync(dir)) {
        let matchedFiles: string = '';
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file.startsWith('RedisInsight_connections_')) {
                matchedFiles = file;
            }
        }
        return matchedFiles;
    }
    return '';
}

fixture `Import databases`
    .meta({ type: 'critical_path', rte: rte.none })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await addNewOSSClusterDatabaseApi(ossClusterConfig);
        await discoverSentinelDatabaseApi(ossSentinelConfig);
        await common.reloadPage();
    })
    .afterEach(async () => {
        // Delete standalone db
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
        // Delete OSS cluster db
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
        // Delete all sentinel primary groups
        const sentinelCopy = ossSentinelConfig;
        sentinelCopy.masters.push(ossSentinelConfig.masters[1]);
        sentinelCopy.name.push(ossSentinelConfig.name[1]);
        await deleteAllSentinelDatabasesApi(sentinelCopy);
    })
test('Exporting Standalone, OSS Cluster, and Sentinel connection types', async t => {
    const databaseNames = [ossStandaloneConfig.databaseName, ossClusterConfig.ossClusterDatabaseName, ossSentinelConfig.name[1]];
    const downloadedFilePath = await getFileDownloadPath();

    // Select databases checkboxes
    await databasesActions.selectDatabasesByNames(databaseNames);
    await t.click(myRedisDatabasePage.exportBtn);
    await t.click(myRedisDatabasePage.exportSelectedDbsBtn);
    await t.wait(3000);
    // Verify that user can export database with passwords and client certificates with “Export database passwords and client certificates” control selected
    await t.expect(await findFileByFileStarts(downloadedFilePath)).contains('RedisInsight_connections_', 'The Exported file not saved');
});
