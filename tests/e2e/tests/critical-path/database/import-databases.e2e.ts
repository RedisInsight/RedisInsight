import * as path from 'path';
import { rte } from '../../../helpers/constants';
import { BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl } from '../../../helpers/conf';
import { acceptLicenseTerms, clickOnEditDatabaseByName } from '../../../helpers/database';
import { deleteStandaloneDatabasesByNamesApi } from '../../../helpers/api/api-database';
import { DatabasesActions } from '../../../common-actions/databases-actions';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databasesActions = new DatabasesActions();

const fileNames = {
    racompassValidJson: 'racompass-valid.json',
    racompassInvalidJson: 'racompass-invalid.json',
    rdmFullJson: 'rdm-full.json',
    rdmCertsJson: 'rdm-certificates.json',
    ardmValidAno: 'ardm-valid.ano',
    racompFullSSHJson: 'racompFullSSH.json'
};
const filePathes = {
    ardmValidPath: path.join('..', '..', '..', 'test-data', 'import-databases', fileNames.ardmValidAno),
    racompassInvalidJsonPath: path.join('..', '..', '..', 'test-data', 'import-databases', fileNames.racompassInvalidJson),
    rdmPath: path.join('..', '..', '..', 'test-data', 'import-databases', fileNames.rdmFullJson),
    rdmCertsPath: path.join('..', '..', '..', 'test-data', 'import-databases', fileNames.rdmCertsJson),
    racompassValidJson: path.join('..', '..', '..', 'test-data', 'import-databases', fileNames.racompassValidJson),
    racompassSshPath: path.join('..', '..', '..', 'test-data', 'import-databases', fileNames.racompFullSSHJson)
};

const rdmListOfDB = databasesActions.parseDbJsonByPath(path.join('test-data', 'import-databases', fileNames.rdmFullJson));
const rdmListOfCertsDB = databasesActions.parseDbJsonByPath(path.join('test-data', 'import-databases', fileNames.rdmCertsJson));
const racompListOfSSHDB = databasesActions.parseDbJsonByPath(path.join('test-data', 'import-databases', fileNames.racompFullSSHJson));
const rdmResults = {
    successNames: myRedisDatabasePage.getDatabaseNamesFromListByResult(rdmListOfDB, 'success'),
    partialNames: myRedisDatabasePage.getDatabaseNamesFromListByResult(rdmListOfDB, 'partial'),
    failedNames: myRedisDatabasePage.getDatabaseNamesFromListByResult(rdmListOfDB, 'failed')
};
const racompassSshResults = {
    successNames: myRedisDatabasePage.getDatabaseNamesFromListByResult(racompListOfSSHDB, 'success'),
    partialNames: myRedisDatabasePage.getDatabaseNamesFromListByResult(racompListOfSSHDB, 'partial'),
    failedNames: myRedisDatabasePage.getDatabaseNamesFromListByResult(racompListOfSSHDB, 'failed')

};
const rdmCertsNames = myRedisDatabasePage.getDatabaseNamesFromListByResult(rdmListOfCertsDB, 'success');

const rdmData = {
    type: 'rdm',
    path: filePathes.rdmPath,
    sshPath: filePathes.rdmCertsPath,
    connectionType: 'Cluster',
    successNumber: rdmResults.successNames.length,
    partialNumber: rdmResults.partialNames.length,
    failedNumber: rdmResults.failedNames.length,
    dbImportedNames: [...rdmResults.successNames, ...rdmResults.partialNames]
};
const racompSSHData = {
    type: 'racompass',
    path: filePathes.racompassSshPath,
    successNumber: racompassSshResults.successNames.length,
    partialNumber: racompassSshResults.partialNames .length,
    failedNumber: racompassSshResults.failedNames.length,
    importedSSHdbNames: [ ...racompassSshResults.successNames, ...racompassSshResults.partialNames ]
};
const dbData = [
    {
        type: 'racompass',
        path: filePathes.racompassValidJson,
        dbNames: ['racompassCluster', 'racompassDbWithIndex:8100 [db1]']
    },
    {
        type: 'ardm',
        path: filePathes.ardmValidPath,
        dbNames: ['ardmNoName:12001', 'ardmWithPassAndUsername', 'ardmSentinel']
    }
];
const databasesToDelete = [
    dbData[0].dbNames[0],
    dbData[0].dbNames[1].split(' ')[0],
    ...dbData[1].dbNames
];
const findImportedRdmDbNameInList = async(dbName: string): Promise<string> => rdmData.dbImportedNames.find(item => item === dbName)!;

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
    const parseFailedMsg2 = `Unable to parse ${fileNames.racompassInvalidJson}`;

    // Verify that user can see the “Import Database Connections” tooltip
    await t.expect(myRedisDatabasePage.importDatabasesBtn.visible).ok('The import databases button not displayed');
    await t.hover(myRedisDatabasePage.importDatabasesBtn);
    await t.expect(browserPage.tooltip.innerText).contains(tooltipText, 'The tooltip message not displayed/correct');

    // Verify that Import dialogue is not closed when clicking any area outside the box
    await t.click(myRedisDatabasePage.importDatabasesBtn);
    await t.expect(myRedisDatabasePage.importDbDialog.exists).ok('Import Database Connections dialog not opened');
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    await t.expect(myRedisDatabasePage.importDbDialog.exists).ok('Import Database Connections dialog not displayed');

    // Verify that user see the message when parse error appears
    await t
        .setFilesToUpload(myRedisDatabasePage.importDatabaseInput, [filePathes.racompassInvalidJsonPath])
        .click(myRedisDatabasePage.submitImportBtn)
        .expect(myRedisDatabasePage.failedImportMessage.exists).ok('Failed to add database message not displayed')
        .expect(myRedisDatabasePage.failedImportMessage.textContent).contains(parseFailedMsg)
        .expect(myRedisDatabasePage.failedImportMessage.textContent).contains(parseFailedMsg2);

    // Verify that user can remove file from import input
    await t.click(myRedisDatabasePage.closeDialogBtn);
    await t.click(myRedisDatabasePage.importDatabasesBtn);
    await t.setFilesToUpload(myRedisDatabasePage.importDatabaseInput, [rdmData.path]);
    await t.expect(myRedisDatabasePage.importDbDialog.textContent).contains(fileNames.rdmFullJson, 'Filename not displayed in import input');
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
        await t.expect(myRedisDatabasePage.AddRedisDatabase.usernameInput.value).eql(rdmListOfDB[1].username, 'Username import incorrect');
        // Verify password imported
        await t.click(myRedisDatabasePage.AddRedisDatabase.showPasswordBtn);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.passwordInput.value).eql(rdmListOfDB[1].auth, 'Password import incorrect');

        // Verify cluster connection type imported
        await clickOnEditDatabaseByName(rdmData.dbImportedNames[2]);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.connectionType.textContent).eql(rdmData.connectionType, 'Connection type import incorrect');

        /*
           Verify that user can import database with CA certificate
           Verify that user can import database with certificates by an absolute folder path(CA certificate, Client certificate, Client private key)
           Verify that user can see the certificate name as the certificate file name
           */
        await clickOnEditDatabaseByName(await findImportedRdmDbNameInList('rdmHost+Port+Name+CaCert'));
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql('ca', 'CA certificate import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.exists).notOk('Client certificate was imported');

        // Verify that user can import database with Client certificate, Client private key
        await clickOnEditDatabaseByName(await findImportedRdmDbNameInList('rdmHost+Port+Name+clientCert+privateKey'));
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql('No CA Certificate', 'CA certificate was imported');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).eql('client', 'Client certificate import incorrect');

        // Verify that user can import database with all certificates
        await clickOnEditDatabaseByName(await findImportedRdmDbNameInList('rdmHost+Port+Name+CaCert+clientCert+privateKey'));
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql('ca', 'CA certificate import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).eql('client', 'Client certificate import incorrect');

        // Verify that certificate not imported when any certificate field has not been parsed
        await clickOnEditDatabaseByName(await findImportedRdmDbNameInList('rdmCaCertInvalidBody'));
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql('No CA Certificate', 'CA certificate was imported');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.exists).notOk('Client certificate was imported');
        await clickOnEditDatabaseByName(await findImportedRdmDbNameInList('rdmInvalidClientCert'));
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql('No CA Certificate', 'CA certificate was imported');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.exists).notOk('Client certificate was imported');

        // Verify that user can import files from Racompass, ARDM, RDM
        for (const db of dbData) {
            await databasesActions.importDatabase(db);
            await t.click(myRedisDatabasePage.okDialogBtn);
            await databasesActions.verifyDatabasesDisplayed(db.dbNames);
        }

        // Verify that user can import Sentinel database connections by corresponding fields in JSON
        await clickOnEditDatabaseByName(dbData[1].dbNames[2]);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.sentinelForm.textContent).contains('Sentinel', 'Sentinel connection type import incorrect');
        await myRedisDatabasePage.clickOnDBByName(dbData[1].dbNames[2]);
        await Common.checkURLContainsText('browser');
    });
test
    .after(async() => {
        // Delete databases
        await deleteStandaloneDatabasesByNamesApi(rdmCertsNames);
    })('Certificates import with/without path', async t => {
        await databasesActions.importDatabase({ path: rdmData.sshPath });
        await t.click(myRedisDatabasePage.okDialogBtn);

        // Verify that when user imports a certificate and the same certificate body already exists, the existing certificate (with its name) is applied
        await clickOnEditDatabaseByName(rdmListOfCertsDB[0].name);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql(rdmListOfCertsDB[0].caCert.name, 'CA certificate import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).eql(rdmListOfCertsDB[0].clientCert.name, 'Client certificate import incorrect');

        await clickOnEditDatabaseByName(rdmListOfCertsDB[1].name);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql(rdmListOfCertsDB[0].caCert.name, 'CA certificate name with the same body is incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).eql(rdmListOfCertsDB[0].clientCert.name, 'Client certificate name with the same body is incorrect');

        // Verify that when user imports a certificate and the same certificate name exists but with a different body, the certificate imported with "({incremental_number})_certificate_name" name
        await clickOnEditDatabaseByName(rdmListOfCertsDB[2].name);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql(`1_${rdmListOfCertsDB[0].caCert.name}`, 'CA certificate name with the same body is incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).eql(`1_${rdmListOfCertsDB[0].clientCert.name}`, 'Client certificate name with the same body is incorrect');

        // Verify that when user imports a certificate by path and the same certificate body already exists, the existing certificate (with its name) is applied
        await clickOnEditDatabaseByName(rdmListOfCertsDB[3].name);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql('caPath', 'CA certificate import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).eql('clientPath', 'Client certificate import incorrect');

        await clickOnEditDatabaseByName(rdmListOfCertsDB[4].name);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql('caPath', 'CA certificate import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).eql('clientPath', 'Client certificate import incorrect');

        // Verify that when user imports a certificate by path and the same certificate name exists but with a different body, the certificate imported with "({incremental_number})certificate_name" name
        await clickOnEditDatabaseByName(rdmListOfCertsDB[5].name);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.caCertField.textContent).eql('1_caPath', 'CA certificate import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.clientCertField.textContent).eql('1_clientPath', 'Client certificate import incorrect');
    });
test
    .after(async() => {
        // Delete databases
        await deleteStandaloneDatabasesByNamesApi(racompSSHData.importedSSHdbNames);
    })('Import SSH parameters', async t => {
        const sshAgentsResult = 'SSH Agents are not supported';
        const sshPrivateKey = '-----BEGIN OPENSSH PRIVATE KEY-----';

        await databasesActions.importDatabase(racompSSHData);
        // Fully imported table with SSH
        await t.expect(myRedisDatabasePage.successResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${racompSSHData.successNumber}`, 'Not correct successfully SSH imported number');
        // Partially imported table with SSH
        await t.expect(myRedisDatabasePage.partialResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${racompSSHData.partialNumber}`, 'Not correct partially SSH imported number');
        // Failed to import table with SSH
        await t.expect(myRedisDatabasePage.failedResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${racompSSHData.failedNumber}`, 'Not correct SSH import failed number');
        // Expand partial results
        await t.click(myRedisDatabasePage.partialResultsAccordion);
        // Verify that database is partially imported with corresponding message when the ssh_agent_path specified in imported JSON
        await t.expect(myRedisDatabasePage.importResult.withText(sshAgentsResult).exists).ok('SSH agents not supported message not displayed in result');

        await t.click(myRedisDatabasePage.okDialogBtn);
        await clickOnEditDatabaseByName(racompListOfSSHDB[0].name);
        // Verify that user can import the SSH parameters with Password
        await t.expect(myRedisDatabasePage.AddRedisDatabase.sshHostInput.value).eql(racompListOfSSHDB[0].sshHost, 'SSH host import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.sshPortInput.value).eql((racompListOfSSHDB[0].sshPort).toString(), 'SSH port import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.sshUsernameInput.value).eql(racompListOfSSHDB[0].sshUser, 'SSH username import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.sshPasswordInput.value).eql(racompListOfSSHDB[0].sshPassword, 'SSH password import incorrect');

        await clickOnEditDatabaseByName(racompListOfSSHDB[1].name);
        // Verify that user can import the SSH Private Key both by its value specified in the file and by the file path
        await t.expect(myRedisDatabasePage.AddRedisDatabase.sshPrivateKeyInput.textContent).contains(sshPrivateKey, 'SSH Private key import incorrect');
        // Verify that user can import the SSH parameters with Passcode
        await t.expect(myRedisDatabasePage.AddRedisDatabase.sshPassphraseInput.value).eql(racompListOfSSHDB[1].sshKeyPassphrase, 'SSH Passphrase import incorrect');
    });
