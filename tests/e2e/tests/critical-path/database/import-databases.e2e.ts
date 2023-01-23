import * as path from 'path';
import { ClientFunction } from 'testcafe';
import { rte } from '../../../helpers/constants';
import { AddRedisDatabasePage, BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl } from '../../../helpers/conf';
import { acceptLicenseTerms, clickOnEditDatabaseByName } from '../../../helpers/database';
import { deleteStandaloneDatabasesByNamesApi } from '../../../helpers/api/api-database';
import { DatabasesActions } from '../../../common-actions/databases-actions';

const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databasesActions = new DatabasesActions();
const addRedisDatabasePage = new AddRedisDatabasePage();

const racompassValidJson = 'racompass-valid.json';
const racompassInvalidJson = 'racompass-invalid.json';
const rdmFullJson = 'rdm-full.json';
const rdmCertsJson = 'rdm-certificates.json';
const ardmValidAno = 'ardm-valid.ano';
const racompassInvalidJsonPath = path.join('..', '..', '..', 'test-data', 'import-databases', racompassInvalidJson);
const rdmListOfDB = databasesActions.parseDbJsonByPath(path.join('test-data', 'import-databases', rdmFullJson));
const rdmCertsListOfDB = databasesActions.parseDbJsonByPath(path.join('test-data', 'import-databases', rdmCertsJson));
const rdmSuccessNames = myRedisDatabasePage.getDatabaseNamesFromListByResult(rdmListOfDB, 'success');
const rdmPartialNames = myRedisDatabasePage.getDatabaseNamesFromListByResult(rdmListOfDB, 'partial');
const rdmFailedNames = myRedisDatabasePage.getDatabaseNamesFromListByResult(rdmListOfDB, 'failed');
const rdmCertsNames = myRedisDatabasePage.getDatabaseNamesFromListByResult(rdmCertsListOfDB, 'success');
const rdmData = {
    type: 'rdm',
    path: path.join('..', '..', '..', 'test-data', 'import-databases', rdmFullJson),
    connectionType: 'Cluster',
    successNumber: rdmSuccessNames.length,
    partialNumber: rdmPartialNames.length,
    failedNumber: rdmFailedNames.length,
    dbImportedNames: [...rdmSuccessNames, ...rdmPartialNames]
};
const rdmCertsData = {
    type: 'rdm',
    path: path.join('..', '..', '..', 'test-data', 'import-databases', rdmCertsJson),
    parsedJson: databasesActions.parseDbJsonByPath(path.join('test-data', 'import-databases', rdmCertsJson))
};
const dbData = [
    {
        type: 'racompass',
        path: path.join('..', '..', '..', 'test-data', 'import-databases', racompassValidJson),
        dbNames: ['racompassCluster', 'racompassDbWithIndex:8100 [db1]']
    },
    {
        type: 'ardm',
        path: path.join('..', '..', '..', 'test-data', 'import-databases', ardmValidAno),
        dbNames: ['ardmNoName:12001', 'ardmWithPassAndUsername', 'ardmSentinel']
    }
];
const databasesToDelete = [
    dbData[0].dbNames[0],
    dbData[0].dbNames[1].split(' ')[0],
    ...dbData[1].dbNames
];
const findImportedRdmDbNameInList = async(dbName: string): Promise<string> => rdmData.dbImportedNames.find(item => item === dbName)!;
// Returns the URL of the current web page
const getPageUrl = ClientFunction(() => window.location.href);

fixture `Import databases`
    .meta({ type: 'critical_path', rte: rte.none })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    });
test('Connection import modal window', async t => {
    const tooltipText = 'Import Database Connections';
    const defaultText = 'Select or drag and drop a file';
    const parseFailedMsg = 'Failed to add database connections';
    const parseFailedMsg2 = `Unable to parse ${racompassInvalidJson}`;

    // Verify that user can see the “Import Database Connections” tooltip
    await t.expect(myRedisDatabasePage.importDatabasesBtn.visible).ok('The import databases button not displayed');
    await t.hover(myRedisDatabasePage.importDatabasesBtn);
    await t.expect(browserPage.tooltip.innerText).contains(tooltipText, 'The tooltip message not displayed/correct');

    // Verify that Import dialogue is not closed when clicking any area outside the box
    await t.click(myRedisDatabasePage.importDatabasesBtn);
    await t.expect(myRedisDatabasePage.importDbDialog.exists).ok('Import Database Connections dialog not opened');
    await t.click(myRedisDatabasePage.myRedisDBButton);
    await t.expect(myRedisDatabasePage.importDbDialog.exists).ok('Import Database Connections dialog not displayed');

    // Verify that user see the message when parse error appears
    await t
        .setFilesToUpload(myRedisDatabasePage.importDatabaseInput, [racompassInvalidJsonPath])
        .click(myRedisDatabasePage.submitImportBtn)
        .expect(myRedisDatabasePage.failedImportMessage.exists).ok('Failed to add database message not displayed')
        .expect(myRedisDatabasePage.failedImportMessage.textContent).contains(parseFailedMsg)
        .expect(myRedisDatabasePage.failedImportMessage.textContent).contains(parseFailedMsg2);

    // Verify that user can remove file from import input
    await t.click(myRedisDatabasePage.closeDialogBtn);
    await t.click(myRedisDatabasePage.importDatabasesBtn);
    await t.setFilesToUpload(myRedisDatabasePage.importDatabaseInput, [rdmData.path]);
    await t.expect(myRedisDatabasePage.importDbDialog.textContent).contains(rdmFullJson, 'Filename not displayed in import input');
    // Click on remove button
    await t.click(myRedisDatabasePage.removeImportedFileBtn);
    await t.expect(myRedisDatabasePage.importDbDialog.textContent).contains(defaultText, 'File not removed from import input');
});
test
    .after(async() => {
        // Delete databases
        await deleteStandaloneDatabasesByNamesApi([...rdmData.dbImportedNames, ...databasesToDelete]);
    })('Connection import from JSON', async t => {
        // Verify that user can import database with mandatory/optional fields
        await databasesActions.importDatabase(rdmData);

        // Fully imported table
        await t.expect(myRedisDatabasePage.successResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${rdmData.successNumber}`, 'Not correct successfully imported number');
        // Partially imported table
        await t.expect(myRedisDatabasePage.partialResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${rdmData.partialNumber}`, 'Not correct partially imported number');
        // Failed to import table
        await t.expect(myRedisDatabasePage.failedResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${rdmData.failedNumber}`, 'Not correct import failed number');

        // Verify that list of databases is reloaded when database added
        await t.click(myRedisDatabasePage.okDialogBtn);
        await databasesActions.verifyDatabasesDisplayed(rdmData.dbImportedNames);

        await clickOnEditDatabaseByName(rdmData.dbImportedNames[1]);
        // Verify username imported
        await t.expect(addRedisDatabasePage.usernameInput.value).eql(rdmListOfDB[1].username, 'Username import incorrect');
        // Verify password imported
        await t.click(addRedisDatabasePage.showPasswordBtn);
        await t.expect(addRedisDatabasePage.passwordInput.value).eql(rdmListOfDB[1].auth, 'Password import incorrect');

        // Verify cluster connection type imported
        await clickOnEditDatabaseByName(rdmData.dbImportedNames[2]);
        await t.expect(addRedisDatabasePage.connectionType.textContent).eql(rdmData.connectionType, 'Connection type import incorrect');

        /*
           Verify that user can import database with CA certificate
           Verify that user can import database with certificates by an absolute folder path(CA certificate, Client certificate, Client private key)
           Verify that user can see the certificate name as the certificate file name
           */
        await clickOnEditDatabaseByName(await findImportedRdmDbNameInList('rdmHost+Port+Name+CaCert'));
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql('ca', 'CA certificate import incorrect');
        await t.expect(addRedisDatabasePage.clientCertField.exists).notOk('Client certificate was imported');

        // Verify that user can import database with Client certificate, Client private key
        await clickOnEditDatabaseByName(await findImportedRdmDbNameInList('rdmHost+Port+Name+clientCert+privateKey'));
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql('No CA Certificate', 'CA certificate was imported');
        await t.expect(addRedisDatabasePage.clientCertField.textContent).eql('client', 'Client certificate import incorrect');

        // Verify that user can import database with all certificates
        await clickOnEditDatabaseByName(await findImportedRdmDbNameInList('rdmHost+Port+Name+CaCert+clientCert+privateKey'));
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql('ca', 'CA certificate import incorrect');
        await t.expect(addRedisDatabasePage.clientCertField.textContent).eql('client', 'Client certificate import incorrect');

        // Verify that certificate not imported when any certificate field has not been parsed
        await clickOnEditDatabaseByName(await findImportedRdmDbNameInList('rdmCaCertInvalidBody'));
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql('No CA Certificate', 'CA certificate was imported');
        await t.expect(addRedisDatabasePage.clientCertField.exists).notOk('Client certificate was imported');
        await clickOnEditDatabaseByName(await findImportedRdmDbNameInList('rdmInvalidClientCert'));
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql('No CA Certificate', 'CA certificate was imported');
        await t.expect(addRedisDatabasePage.clientCertField.exists).notOk('Client certificate was imported');

        // Verify that user can import files from Racompass, ARDM, RDM
        for (const db of dbData) {
            await databasesActions.importDatabase(db);
            await t.click(myRedisDatabasePage.okDialogBtn);
            await databasesActions.verifyDatabasesDisplayed(db.dbNames);
        }

        // Verify that user can import Sentinel database connections by corresponding fields in JSON
        await clickOnEditDatabaseByName(dbData[1].dbNames[2]);
        await t.expect(addRedisDatabasePage.sentinelForm.textContent).contains('Sentinel', 'Sentinel connection type import incorrect');
        await myRedisDatabasePage.clickOnDBByName(dbData[1].dbNames[2]);
        await t.expect(getPageUrl()).contains('browser', 'Sentinel connection not opened');
    });
test
    .after(async() => {
        // Delete databases
        await deleteStandaloneDatabasesByNamesApi(rdmCertsNames);
    })('Certificates import with/without path', async t => {
        await databasesActions.importDatabase(rdmCertsData);
        await t.click(myRedisDatabasePage.okDialogBtn);

        // Verify that when user imports a certificate and the same certificate body already exists, the existing certificate (with its name) is applied
        await clickOnEditDatabaseByName(rdmCertsData.parsedJson[0].name);
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql(rdmCertsData.parsedJson[0].caCert.name, 'CA certificate import incorrect');
        await t.expect(addRedisDatabasePage.clientCertField.textContent).eql(rdmCertsData.parsedJson[0].clientCert.name, 'Client certificate import incorrect');

        await clickOnEditDatabaseByName(rdmCertsData.parsedJson[1].name);
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql(rdmCertsData.parsedJson[0].caCert.name, 'CA certificate name with the same body is incorrect');
        await t.expect(addRedisDatabasePage.clientCertField.textContent).eql(rdmCertsData.parsedJson[0].clientCert.name, 'Client certificate name with the same body is incorrect');

        // Verify that when user imports a certificate and the same certificate name exists but with a different body, the certificate imported with "({incremental_number})_certificate_name" name
        await clickOnEditDatabaseByName(rdmCertsData.parsedJson[2].name);
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql(`1_${rdmCertsData.parsedJson[0].caCert.name}`, 'CA certificate name with the same body is incorrect');
        await t.expect(addRedisDatabasePage.clientCertField.textContent).eql(`1_${rdmCertsData.parsedJson[0].clientCert.name}`, 'Client certificate name with the same body is incorrect');

        // Verify that when user imports a certificate by path and the same certificate body already exists, the existing certificate (with its name) is applied
        await clickOnEditDatabaseByName(rdmCertsData.parsedJson[3].name);
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql('caPath', 'CA certificate import incorrect');
        await t.expect(addRedisDatabasePage.clientCertField.textContent).eql('clientPath', 'Client certificate import incorrect');

        await clickOnEditDatabaseByName(rdmCertsData.parsedJson[4].name);
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql('caPath', 'CA certificate import incorrect');
        await t.expect(addRedisDatabasePage.clientCertField.textContent).eql('clientPath', 'Client certificate import incorrect');

        // Verify that when user imports a certificate by path and the same certificate name exists but with a different body, the certificate imported with "({incremental_number})certificate_name" name
        await clickOnEditDatabaseByName(rdmCertsData.parsedJson[5].name);
        await t.expect(addRedisDatabasePage.caCertField.textContent).eql('1_caPath', 'CA certificate import incorrect');
        await t.expect(addRedisDatabasePage.clientCertField.textContent).eql('1_clientPath', 'Client certificate import incorrect');
    });
