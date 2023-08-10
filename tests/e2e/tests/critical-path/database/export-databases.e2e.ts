import * as fs from 'fs';
import { join as joinPath } from 'path';
import { rte } from '../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../pageObjects';
import {
    cloudDatabaseConfig,
    commonUrl,
    fileDownloadPath,
    ossClusterConfig,
    ossSentinelConfig,
    ossStandaloneConfig,
    ossStandaloneTlsConfig
} from '../../../helpers/conf';
import { DatabaseHelper } from '../../../helpers/database';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { DatabasesActions } from '../../../common-actions/databases-actions';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databasesActions = new DatabasesActions();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let foundExportedFiles: string[];

fixture `Export databases`
    .meta({ type: 'critical_path', rte: rte.none })
    .page(commonUrl);
test
    .before(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneTlsConfig);
        await databaseAPIRequests.addNewOSSClusterDatabaseApi(ossClusterConfig);
        await databaseAPIRequests.discoverSentinelDatabaseApi(ossSentinelConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .after(async() => {
        // Delete all databases
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneTlsConfig);
        await databaseAPIRequests.deleteOSSClusterDatabaseApi(ossClusterConfig);
        await databaseAPIRequests.deleteAllDatabasesByConnectionTypeApi('SENTINEL');
        // Delete exported file
        fs.unlinkSync(joinPath(fileDownloadPath, foundExportedFiles[0]));
    })('Exporting Standalone, OSS Cluster, and Sentinel connection types', async t => {
        const databaseNames = [
            ossStandaloneConfig.databaseName,
            ossStandaloneTlsConfig.databaseName,
            ossClusterConfig.ossClusterDatabaseName,
            ossSentinelConfig.masters[1].alias
        ];

        const compressor = 'Brotli';

        await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
        await myRedisDatabasePage.AddRedisDatabase.setCompressorValue(compressor, true);
        await t.click(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);

        // Select databases checkboxes
        await databasesActions.selectDatabasesByNames(databaseNames);
        // Export connections with passwords
        await t
            .click(myRedisDatabasePage.exportBtn)
            .click(myRedisDatabasePage.exportSelectedDbsBtn)
            .wait(2000);

        // Verify that user can see “RedisInsight_connections_{timestamp}” as the default file name
        foundExportedFiles = await databasesActions.findFilesByFileStarts(fileDownloadPath, 'RedisInsight_connections_');
        // Verify that user can export database with passwords and client certificates with “Export database passwords and client certificates” control selected
        await t.expect(foundExportedFiles.length).gt(0, 'The Exported file not saved');

        // Delete databases
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneTlsConfig);
        await databaseAPIRequests.deleteOSSClusterDatabaseApi(ossClusterConfig);
        await databaseAPIRequests.deleteAllDatabasesByConnectionTypeApi('SENTINEL');
        await myRedisDatabasePage.reloadPage();

        const exportedData = {
            path: joinPath(fileDownloadPath, foundExportedFiles[0]),
            successNumber: 4,
            dbImportedNames: databaseNames
        };

        await databasesActions.importDatabase(exportedData);
        await t.expect(myRedisDatabasePage.successResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${exportedData.successNumber}`, 'Not correct successfully imported number');
        await t.click(myRedisDatabasePage.okDialogBtn);
        // Verify that user can import exported file with all datatypes and certificates
        await databasesActions.verifyDatabasesDisplayed(exportedData.dbImportedNames);

        await databaseHelper.clickOnEditDatabaseByName(databaseNames[1]);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).contains('ca', 'CA certificate import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).contains('client', 'Client certificate import incorrect');
        await t.click(myRedisDatabasePage.AddRedisDatabase.cancelButton);

        await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.selectCompressor.textContent).eql(compressor, 'Compressor import incorrect');

    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneTlsConfig);
        await databaseHelper.addRECloudDatabase(cloudDatabaseConfig);
        await databaseAPIRequests.discoverSentinelDatabaseApi(ossSentinelConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .after(async() => {
        // Delete databases
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneTlsConfig);
        await databaseHelper.deleteDatabase(cloudDatabaseConfig.databaseName);
        await databaseAPIRequests.deleteAllDatabasesByConnectionTypeApi('SENTINEL');
        // Delete exported file
        fs.unlinkSync(joinPath(fileDownloadPath, foundExportedFiles[0]));
    })('Export databases without passwords', async t => {
        const databaseNames = [ossStandaloneTlsConfig.databaseName, cloudDatabaseConfig.databaseName, ossSentinelConfig.masters[1].alias];

        // Select databases checkboxes
        await databasesActions.selectDatabasesByNames(databaseNames);
        // Export connections without passwords
        await t
            .click(myRedisDatabasePage.exportBtn)
            .click(myRedisDatabasePage.exportPasswordsCheckbox)
            .click(myRedisDatabasePage.exportSelectedDbsBtn)
            .wait(2000);

        foundExportedFiles = await databasesActions.findFilesByFileStarts(fileDownloadPath, 'RedisInsight_connections_');
        const parsedExportedJson = await databasesActions.parseDbJsonByPath(joinPath(fileDownloadPath, foundExportedFiles[0]));
        // Verify that user can export databases without database passwords and client key when “Export passwords” control not selected
        for (const db of parsedExportedJson) {
            await t.expect(db.hasOwnProperty('password')).eql(false, 'Databases exported with passwords');
            // Verify for standalone with TLS
            if (db.tls === true) {
                await t.expect(db.clientCert.hasOwnProperty('key')).eql(false, 'Databases exported with client key');
            }
            // Verify for sentinel
            if ('sentinelMaster' in db) {
                await t.expect(db.sentinelMaster.hasOwnProperty('password')).eql(false, 'Sentinel primary group exported with passwords');
            }
        }
    });
