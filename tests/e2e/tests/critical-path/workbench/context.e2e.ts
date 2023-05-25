import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const speed = 0.4;
let indexName = Common.generateWord(5);

fixture `Workbench Context`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    })
    .afterEach(async() => {
        // Drop index, documents and database
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see saved input in Editor when navigates away to any other page', async t => {
    indexName = Common.generateWord(5);
    const command = `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA name TEXT`;
    // Enter the command in the Workbench editor and navigate to Browser
    await t.typeText(workbenchPage.queryInput, command, { replace: true, speed: speed });
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    // Return back to Workbench and check input in editor
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    await t.expect((await workbenchPage.queryInputScriptArea.textContent).replace(/\s/g, ' ')).eql(command, 'Input in Editor is saved');
});
