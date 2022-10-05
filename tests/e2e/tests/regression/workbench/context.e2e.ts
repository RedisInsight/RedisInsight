import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { MyRedisDatabasePage, CliPage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();
const common = new Common();

const speed = 0.4;

fixture `Workbench Context`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async() => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see saved CLI state when navigates away to any other page', async t => {
        //Expand CLI and navigte to Browser
        await t.click(cliPage.cliExpandButton);
        await t.click(myRedisDatabasePage.browserButton);
        //Return back to Workbench and check CLI
        await t.click(myRedisDatabasePage.workbenchButton);
        await t.expect(await cliPage.cliCollapseButton.exists).ok('CLI is still expanded');
    });
// Update after resolving https://redislabs.atlassian.net/browse/RI-3299
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see saved CLI size when navigates away to any other page', async t => {
        const offsetY = 200;

        await t.click(cliPage.cliExpandButton);
        const cliAreaHeight = await cliPage.cliArea.clientHeight;
        const cliAreaHeightEnd = cliAreaHeight + 150;
        const cliResizeButton = await cliPage.cliResizeButton;
        await t.hover(cliResizeButton);
        //Resize CLI 50px up and navigate to the My Redis databases page
        await t.drag(cliResizeButton, 0, -offsetY, { speed: 0.01 });
        await t.click(myRedisDatabasePage.myRedisDBButton);
        //Navigate back to the database Workbench and check CLI size
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.expect(await cliPage.cliArea.clientHeight > cliAreaHeightEnd).ok('Saved context for resizable cli is incorrect');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see all the information removed when reloads the page', async t => {
        const command = 'FT._LIST';
        //Create context modificaions and navigate to Browser
        await t.typeText(workbenchPage.queryInput, command, { replace: true, speed: speed});
        await t.click(cliPage.cliExpandButton);
        await t.click(myRedisDatabasePage.browserButton);
        //Open Workbench page and verify context
        await t.click(myRedisDatabasePage.workbenchButton);
        await t.expect(await cliPage.cliCollapseButton.exists).ok('CLI is still expanded');
        await t.expect(await workbenchPage.queryInputScriptArea.textContent).eql(command, 'Input in Editor is saved');
        //Reload the window and chek context
        await common.reloadPage();
        await t.expect(await cliPage.cliCollapseButton.exists).notOk('CLI is collapsed');
        await t.expect(await workbenchPage.queryInputScriptArea.textContent).eql('', 'Input in Editor is removed');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see saved state of the Enablement area when navigates back to the Workbench from other page', async t => {
        //Collapse the Enablement area and open Settings
        await t.hover(workbenchPage.preselectArea);
        await t.click(workbenchPage.collapsePreselectAreaButton);
        await t.click(myRedisDatabasePage.settingsButton);
        //Navigate back to Workbench and Verify the context
        await t.click(myRedisDatabasePage.workbenchButton);
        await t.expect(workbenchPage.enablementAreaTreeView.visible).notOk('The Enablement area is still collapsed');
    });
