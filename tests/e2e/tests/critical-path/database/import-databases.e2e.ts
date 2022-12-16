import * as fs from 'fs';
import * as path from 'path';
import { rte } from '../../../helpers/constants';
import { AddRedisDatabasePage, BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl } from '../../../helpers/conf';
import { acceptLicenseTerms, clickOnEditDatabaseByName } from '../../../helpers/database';
import { deleteStandaloneDatabasesByNamesApi } from '../../../helpers/api/api-database';
import { DatabasesActions } from '../../../common-actions/databases-actions';
// import rdmJson from '../../../test-data/rdm-full.json' assert {type: 'json'};
// import  * as fil from '../../../test-data/rdm-full.json';
const file = path.join('test-data', 'rdm-full.json');

const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databasesActions = new DatabasesActions();
const addRedisDatabasePage = new AddRedisDatabasePage();

const racompassValidJson = 'racompass-valid.json';
const racompassInvalidJson = 'racompass-invalid.json';
const rdmValidJson = 'rdm-valid.json';
const rdmFullJson = 'rdm-full.json';
const ardmValidAno = 'ardm-valid.ano';
const listOfDB = JSON.parse(fs.readFileSync(file, 'utf-8'));
const dbSuccessNames = listOfDB.filter(element => element.result === 'success').map(item => item.name);

const rdmData = {
    type: 'rdm',
    path: path.join('..', '..', '..', 'test-data', rdmFullJson),
    dbNames: ['rdmWithUsernameAndPass1:1561', 'rdmOnlyHostPortDB2:6379'],
    userName: 'rdmUsername',
    password: 'rdmAuth',
    connectionType: 'Cluster',
    fileName: rdmFullJson,
    successNumber: dbSuccessNames.length,
    partialNumber: 8,
    failedNumber: 6
};
const dbData = [
    {
        type: 'racompass',
        path: path.join('..', '..', '..', 'test-data', racompassValidJson),
        dbNames: ['racompassCluster', 'racompassDbWithIndex:8100 [1]']
    },
    {
        type: 'ardm',
        path: path.join('..', '..', '..', 'test-data', ardmValidAno),
        dbNames: ['ardmNoName:12001', 'ardmWithPassAndUsername']
    }
];
// List of all created databases to delete
const databases = [
    rdmData.dbNames[0],
    rdmData.dbNames[1],
    dbData[0].dbNames[0],
    dbData[0].dbNames[1].split(' ')[0],
    dbData[1].dbNames[0],
    dbData[1].dbNames[1]
];

fixture `Import databases`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);
test
    .before(async() => {
        await acceptLicenseTerms();
    })
    .after(async() => {
        // Delete databases
        deleteStandaloneDatabasesByNamesApi(databases);
    })('Connection import from JSON', async t => {
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
            .setFilesToUpload(myRedisDatabasePage.importDatabaseInput, [path.join('..', '..', '..', 'test-data', racompassInvalidJson)])
            .click(myRedisDatabasePage.submitImportBtn)
            .expect(myRedisDatabasePage.failedImportMessage.exists).ok('Failed to add database message not displayed')
            .expect(myRedisDatabasePage.failedImportMessage.textContent).contains(parseFailedMsg)
            .expect(myRedisDatabasePage.failedImportMessage.textContent).contains(parseFailedMsg2);

        // Verify that user can remove file from import input
        await t.click(myRedisDatabasePage.closeDialogBtn);
        await t.click(myRedisDatabasePage.importDatabasesBtn);
        await t.setFilesToUpload(myRedisDatabasePage.importDatabaseInput, [rdmData.path]);
        await t.expect(myRedisDatabasePage.importDbDialog.textContent).contains(rdmData.fileName, 'Filename not displayed in import input');
        // Click on remove button
        await t.click(myRedisDatabasePage.removeImportedFileBtn);
        await t.expect(myRedisDatabasePage.importDbDialog.textContent).contains(defaultText, 'File not removed from import input');

        // Verify that user can import database with mandatory fields
        await t.click(myRedisDatabasePage.closeDialogBtn);
        await databasesActions.importDatabase(rdmData);
        // Verify that success message is displayed
        await t.expect(myRedisDatabasePage.successResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${rdmData.successNumber}`, 'Not correct successfully imported number');
        await t.expect(myRedisDatabasePage.partialResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${rdmData.partialNumber}`, 'Not correct partially imported number');
        await t.expect(myRedisDatabasePage.failedResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${rdmData.failedNumber}`, 'Not correct failed to import number');




        // Verify that list of databases is reloaded when database added
        await t.click(myRedisDatabasePage.okDialogBtn);
        await databasesActions.verifyDatabasesDisplayed(rdmData.dbNames);

        // Verify that user can import database with mandatory+optional data
        await clickOnEditDatabaseByName(rdmData.dbNames[0]);
        // Verify username imported
        await t.expect(addRedisDatabasePage.usernameInput.value).eql(rdmData.userName);
        // Verify password imported
        await t.click(addRedisDatabasePage.showPasswordBtn);
        await t.expect(addRedisDatabasePage.passwordInput.value).eql(rdmData.password);
        // Verify cluster connection type imported
        await t.expect(addRedisDatabasePage.connectionType.textContent).eql(rdmData.connectionType);

        // Verify that user can import files from Racompass, ARDM, RDM
        for (const db of dbData) {
            await databasesActions.importDatabase(db);
            await t.click(myRedisDatabasePage.okDialogBtn);
            await databasesActions.verifyDatabasesDisplayed(db.dbNames);
        }
    });
    test.only
    .before(async() => {
        await acceptLicenseTerms()
    })('Connection import from JSON', async t => {
        console.log(dbSuccessNames);
        console.log(rdmData.successNumber);

        await databasesActions.importDatabase(rdmData);
        // Verify that success message is displayed
        await t.expect(myRedisDatabasePage.successResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${rdmData.successNumber}`, 'Not correct successfully imported number');
        await databasesActions.verifyDatabasesDisplayed(dbSuccessNames);
    });
