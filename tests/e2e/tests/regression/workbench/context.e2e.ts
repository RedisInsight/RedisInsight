import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const speed = 0.4;

fixture `Workbench Context`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see saved CLI state when navigates away to any other page', async t => {
    // Expand CLI and navigate to Browser
    await t.click(workbenchPage.Cli.cliExpandButton);
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    // Return back to Workbench and check CLI
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    await t.expect(workbenchPage.Cli.cliCollapseButton.exists).ok('CLI is not expanded');
});
// Update after resolving https://redislabs.atlassian.net/browse/RI-3299
test('Verify that user can see saved CLI size when navigates away to any other page', async t => {
    const offsetY = 200;

    await t.click(workbenchPage.Cli.cliExpandButton);
    const cliAreaHeight = await workbenchPage.Cli.cliArea.clientHeight;
    const cliAreaHeightEnd = cliAreaHeight + 150;
    const cliResizeButton = workbenchPage.Cli.cliResizeButton;
    await t.hover(cliResizeButton);
    // Resize CLI 50px up and navigate to the My Redis databases page
    await t.drag(cliResizeButton, 0, -offsetY, { speed: 0.01 });
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    // Navigate back to the database Workbench and check CLI size
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.expect(await workbenchPage.Cli.cliArea.clientHeight > cliAreaHeightEnd).ok('Saved context for resizable cli is incorrect');
});
test('Verify that user can see all the information removed when reloads the page', async t => {
    const command = 'FT._LIST';
    // Create context modificaions and navigate to Browser
    await t.typeText(workbenchPage.queryInput, command, { replace: true, speed: speed});
    await t.click(workbenchPage.Cli.cliExpandButton);
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    // Open Workbench page and verify context
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    await t.expect(workbenchPage.Cli.cliCollapseButton.exists).ok('CLI is not expanded');
    await t.expect(workbenchPage.queryInputScriptArea.textContent).eql(command, 'Input in Editor is not saved');
    // Reload the window and chek context
    await workbenchPage.reloadPage();
    await t.expect(workbenchPage.Cli.cliCollapseButton.exists).notOk('CLI is not collapsed');
    await t.expect(workbenchPage.queryInputScriptArea.textContent).eql('', 'Input in Editor is not removed');
});
test('Verify that user can see saved state of the Enablement area when navigates back to the Workbench from other page', async t => {
    // Collapse the Enablement area and open Settings
    await t.hover(workbenchPage.preselectArea);
    await t.click(workbenchPage.collapsePreselectAreaButton);
    await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
    // Navigate back to Workbench and Verify the context
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    await t.expect(workbenchPage.enablementAreaTreeView.visible).notOk('The Enablement area is not collapsed');
});
