import { DatabaseHelper } from '../../../../helpers/database';
import {
    MyRedisDatabasePage,
    WorkbenchPage,
    BrowserPage
} from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossStandaloneNoPermissionsConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { WorkbenchActions } from '../../../../common-actions/workbench-actions';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const workbenchActions = new WorkbenchActions();

fixture `Monitor`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);

test
    .before(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        await browserPage.Cli.sendCommandInCli('acl setuser noperm nopass on +@all ~* -monitor -client');
        // // Check command result in CLI
        // await t.click(browserPage.Cli.cliExpandButton);
        // await t.expect(browserPage.Cli.cliOutputResponseSuccess.textContent).eql('"OK"', 'Command from autocomplete was not found & executed');
        // await t.click(browserPage.Cli.cliCollapseButton);
        // await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await t.click(browserPage.Cli.cliExpandButton);
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneNoPermissionsConfig);
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await browserPage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneNoPermissionsConfig.databaseName);
    })
    .after(async t => {
        // Delete created user
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.Cli.sendCommandInCli('acl DELUSER noperm');
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabasesApi([ossStandaloneConfig, ossStandaloneNoPermissionsConfig]);
    })('Verify that if user doesn\'t have permissions to run monitor, user can see error message', async t => {
        const command = 'CLIENT LIST';
        // Expand the Profiler
        await t.click(browserPage.Profiler.expandMonitor);
        // Click on run monitor button
        await t.click(browserPage.Profiler.startMonitorButton);
        // Check that error message is displayed
        await t.expect(browserPage.Profiler.monitorNoPermissionsMessage.visible).ok('Error message not found');
        // Check the error message text
        await t.expect(browserPage.Profiler.monitorNoPermissionsMessage.innerText).eql('The Profiler cannot be started. This user has no permissions to run the \'monitor\' command', 'No Permissions message not found');
        // Verify that if user doesn't have permissions to run monitor, run monitor button is not available
        await t.expect(browserPage.Profiler.runMonitorToggle.withAttribute('disabled').exists).ok('No permissions run icon not found');
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
        await workbenchPage.sendCommandInWorkbench(command);
        // Verify that user have the following error when there is no permission to run the CLIENT LIST: "NOPERM this user has no permissions to run the 'CLIENT LIST' command or its subcommand"
        await workbenchActions.verifyClientListErrorMessage();
    });
