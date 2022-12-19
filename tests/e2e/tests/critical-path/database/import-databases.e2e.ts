import * as fs from 'fs';
import * as path from 'path';
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
const ardmValidAno = 'ardm-valid.ano';
const listOfDB = JSON.parse(fs.readFileSync(path.join('test-data', 'import-databases', 'rdm-full.json'), 'utf-8'));
const dbSuccessNames = listOfDB.filter(element => element.result === 'success').map(item => item.name);
const dbPartialNames = listOfDB.filter(element => element.result === 'partial').map(item => item.name);
const dbFailedNames = listOfDB.filter(element => element.result === 'failed').map(item => item.name);
const dbImportedNames = [...dbSuccessNames, ...dbPartialNames];
const rdmData = {
    type: 'rdm',
    path: path.join('..', '..', '..', 'test-data', 'import-databases', rdmFullJson),
    connectionType: 'Cluster',
    successNumber: dbSuccessNames.length,
    partialNumber: dbPartialNames.length,
    failedNumber: dbFailedNames.length
};
const dbData = [
    {
        type: 'racompass',
        path: path.join('..', '..', '..', 'test-data', 'import-databases', racompassValidJson),
        dbNames: ['racompassCluster', 'racompassDbWithIndex:8100 [1]']
    },
    {
        type: 'ardm',
        path: path.join('..', '..', '..', 'test-data', 'import-databases', ardmValidAno),
        dbNames: ['ardmNoName:12001', 'ardmWithPassAndUsername']
    }
];
const racompassInvalidJsonPath = path.join('..', '..', '..', 'test-data', 'import-databases', racompassInvalidJson);
// List of all created databases to delete
const databases = [
    dbData[0].dbNames[0],
    dbData[0].dbNames[1].split(' ')[0],
    dbData[1].dbNames[0],
    dbData[1].dbNames[1]
];
const databasesToDelete = [...dbImportedNames, ...databases];

fixture `Import databases`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    })
    .afterEach(async() => {
        // Delete databases
        deleteStandaloneDatabasesByNamesApi(databasesToDelete);
    });
test('Connection import from JSON', async t => {
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

    // Verify that user can import database with mandatory/optional fields
    await t.click(myRedisDatabasePage.closeDialogBtn);
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
    await databasesActions.verifyDatabasesDisplayed(dbImportedNames);

    await clickOnEditDatabaseByName(dbImportedNames[1]);
    // Verify username imported
    await t.expect(addRedisDatabasePage.usernameInput.value).eql(listOfDB[1].username);
    // Verify password imported
    await t.click(addRedisDatabasePage.showPasswordBtn);
    await t.expect(addRedisDatabasePage.passwordInput.value).eql(listOfDB[1].auth);

    // Verify cluster connection type imported
    await clickOnEditDatabaseByName(dbImportedNames[2]);
    await t.expect(addRedisDatabasePage.connectionType.textContent).eql(rdmData.connectionType);

    // Verify that user can import files from Racompass, ARDM, RDM
    for (const db of dbData) {
        await databasesActions.importDatabase(db);
        await t.click(myRedisDatabasePage.okDialogBtn);
        await databasesActions.verifyDatabasesDisplayed(db.dbNames);
    }
});
