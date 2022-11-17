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

const invalidJsonPath = '../../../test-data/racompass-invalid.json';
const rdmData = {
    type: 'rdm',
    path: '../../../test-data/rdm-valid.json',
    dbNames: ['rdmWithUsernameAndPass1:1561', 'rdmOnlyHostPortDB2:6379'],
    userName: 'rdmUsername',
    password: 'rdmAuth',
    connectionType: 'Cluster'
};
const dbData = [
    {
        type: 'racompass',
        path: '../../../test-data/racompass-valid.json',
        dbNames: ['racompassCluster', 'racompassDbWithIndex:8100 [1]']
    },
    {
        type: 'ardm',
        path: '../../../test-data/ardm-valid.ano',
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
        const partialImportedMsg = 'Successfully added 2 of 6 database connections';

        // Verify that user can see the “Import Database Connections” tooltip
        await t.hover(myRedisDatabasePage.importDatabasesBtn);
        await t.hover(myRedisDatabasePage.importDatabasesBtn);
        await t.expect(browserPage.tooltip.innerText).contains(tooltipText, 'The tooltip message not displayed/correct');

        // Verify that Import dialogue is not closed when clicking any area outside the box
        await t.click(myRedisDatabasePage.importDatabasesBtn);
        await t.expect(myRedisDatabasePage.importDbDialog.exists).ok('Import Database Connections dialog not opened');
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await t.expect(myRedisDatabasePage.importDbDialog.exists).ok('Import Database Connections dialog not displayed');

        // Verify that user see the message when parse error appears
        await t
            .setFilesToUpload(myRedisDatabasePage.importDatabaseInput, [invalidJsonPath])
            .click(myRedisDatabasePage.submitImportBtn)
            .expect(myRedisDatabasePage.failedImportMessage.exists).ok('Failed to add database message not displayed');

        // Verify that user can import database with mandatory fields
        await t.click(myRedisDatabasePage.closeDialogBtn);
        await databasesActions.importDatabase(rdmData.path);
        // Verify that success message is displayed
        await t.expect(myRedisDatabasePage.successImportMessage.textContent).contains(partialImportedMsg, 'Successfully added databases number not correct');
        
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
            await databasesActions.importDatabase(db.path, db.type);
            await t.click(myRedisDatabasePage.okDialogBtn);
            await databasesActions.verifyDatabasesDisplayed(db.dbNames);
        }
    });
