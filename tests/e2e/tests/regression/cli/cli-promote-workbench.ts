import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { CliPage, WorkbenchPage, MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const cliPage = new CliPage();
const workbenchPage = new WorkbenchPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Promote workbench in CLI`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see saved workbench context after redirection from CLI to workbench', async t => {
    // Open Workbench
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    const command = 'INFO';
    await t.typeText(workbenchPage.queryInput, command, { replace: true, speed: 1, paste: true });
    await t.hover(workbenchPage.preselectArea);
    await t.click(workbenchPage.collapsePreselectAreaButton);
    // Turn to Browser page
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    // Verify that users can see workbench promotion message when they open CLI
    await t.click(cliPage.cliExpandButton);
    await t.expect(cliPage.workbenchLink.parent().textContent).eql('Try Workbench, our advanced CLI. Check out our Quick Guides to learn more about Redis capabilities.', 'Wrong promotion message');
    // Verify that user is redirected to Workbench page clicking on workbench link in CLI
    await t.click(cliPage.workbenchLink);
    await t.expect(workbenchPage.expandArea.exists).ok('Workbench page is not opened');
    // Verify that CLI panel is minimized after redirection to workbench from CLI
    await t.expect(cliPage.cliPanel.visible).notOk('Closed CLI');

    // Check content in Workbench area
    await t.expect(workbenchPage.expandPreselectAreaButton.visible).ok('Enablement area is not folded');
    // Check editor
    await t.expect(workbenchPage.mainEditorArea.find('span').withExactText(command).visible).ok('Command is not saved in editor');
});
