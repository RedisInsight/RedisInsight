import * as fs from 'fs';
import { join as joinPath } from 'path';
import { rte } from '../../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    fileDownloadPath,
    ossStandaloneConfig,
    ossStandaloneTlsConfig
} from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { DatabasesActions } from '../../../../common-actions/databases-actions';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databasesActions = new DatabasesActions();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let foundExportedFiles: string[];

fixture `Export and Import databases`
    .meta({ type: 'critical_path', rte: rte.none })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneTlsConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .afterEach(async() => {
        // Delete all databases
        fs.unlinkSync(joinPath(fileDownloadPath, foundExportedFiles[0]));
        await databaseAPIRequests.deleteAllDatabasesApi();
    });
test('Exporting Standalone connection types', async t => {
    const databaseNames = [
        ossStandaloneConfig.databaseName,
        ossStandaloneTlsConfig.databaseName
    ];

    const compressor = 'Brotli';

    await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
    await myRedisDatabasePage.AddRedisDatabase.setCompressorValue(compressor);
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
    await databaseAPIRequests.deleteAllDatabasesApi();
    await myRedisDatabasePage.reloadPage();

    const exportedData = {
        path: joinPath(fileDownloadPath, foundExportedFiles[0]),
        successNumber: databaseNames.length,
        dbImportedNames: databaseNames
    };

    await databasesActions.importDatabase(exportedData);
    await t.expect(myRedisDatabasePage.successResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
        .contains(`${exportedData.successNumber}`, 'Not correct successfully imported number');
    await t.click(myRedisDatabasePage.okDialogBtn);
    // Verify that user can import exported file with all datatypes and certificates
    await databasesActions.verifyDatabasesDisplayed(exportedData.dbImportedNames);

    const modulesDbRedisStackIcon = myRedisDatabasePage.dbNameList.child('span').withExactText(ossStandaloneConfig.databaseName).parent('tr')
        .find(myRedisDatabasePage.cssRedisStackIcon);
        // Verify that db has redis stack icon
    await t.expect(modulesDbRedisStackIcon.exists).ok('module icon is displayed');

    await databaseHelper.clickOnEditDatabaseByName(databaseNames[1]);
    await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).contains('ca', 'CA certificate import incorrect');
    await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).contains('client', 'Client certificate import incorrect');
    await t.click(myRedisDatabasePage.AddRedisDatabase.cancelButton);

    await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
    await t.expect(myRedisDatabasePage.AddRedisDatabase.selectCompressor.textContent).eql(compressor, 'Compressor import incorrect');
});
