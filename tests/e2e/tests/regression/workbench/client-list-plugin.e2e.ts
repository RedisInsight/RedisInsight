import {rte} from '../../../helpers/constants';
import {commonUrl, ossStandaloneRedisearch} from '../../../helpers/conf';
import {acceptLicenseTermsAndAddDatabaseApi} from '../../../helpers/database';
import {deleteStandaloneDatabaseApi} from '../../../helpers/api/api-database';
import {MyRedisDatabasePage, WorkbenchPage} from '../../../pageObjects';
import {WorkbenchActions} from '../../../common-actions/workbench-actions';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const workBenchActions = new WorkbenchActions();

fixture `client list plugin`
    .meta({type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch, ossStandaloneRedisearch.databaseName);
        // Add index and data
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async t => {
        // Drop index and database
        await t.switchToMainWindow();
        await deleteStandaloneDatabaseApi(ossStandaloneRedisearch);
    });
test.only('verify client list plugin shows table', async t => {
    const command = 'CLIENT LIST';
    // Send command in workbench to view client list
    await workbenchPage.sendCommandInWorkbench(command);
    await t.expect(workbenchPage.typeSelectedClientsList.visible).ok('client list view button is not visible');
    await t.switchToIframe(workbenchPage.iframe);
    // Verify that I can see the Client List visualization available for all users.
    await workBenchActions.verifyClientListColumnsAreVisible();
});
