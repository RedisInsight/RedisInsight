import { Chance } from 'chance';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    MonitorPage,
    SettingsPage,
    BrowserPage,
    CliPage, WorkbenchPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig,
    ossStandaloneNoPermissionsConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { addNewStandaloneDatabaseApi, deleteStandaloneDatabaseApi, deleteStandaloneDatabasesApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import {WorkbenchActions} from '../../../common-actions/workbench-actions';

const myRedisDatabasePage = new MyRedisDatabasePage();
const monitorPage = new MonitorPage();
const settingsPage = new SettingsPage();
const browserPage = new BrowserPage();
const cliPage = new CliPage();
const chance = new Chance();
const common = new Common();
const workbenchPage = new WorkbenchPage();
const workbencActions = new WorkbenchActions();

fixture `Monitor`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify Monitor refresh/stop', async t => {
    // Run monitor
    await monitorPage.startMonitor();
    // Close Monitor
    await t.click(monitorPage.closeMonitor);
    // Verify that monitor is not displayed
    await t.expect(monitorPage.monitorArea.visible).notOk('Profiler area not found');
    // Verify that user open monitor again
    await t.click(monitorPage.expandMonitor);
    // Verify that when user closes the Monitor by clicking on "Close Monitor" button Monitor stopped
    await t.expect(monitorPage.startMonitorButton.visible).ok('Start profiler button not found');

    // Run monitor
    await t.click(monitorPage.startMonitorButton);
    await monitorPage.checkCommandInMonitorResults('info');
    // Click on Stop Monitor button
    await t.click(monitorPage.runMonitorToggle);
    // Check that Monitor is stopped
    await t.expect(monitorPage.resetProfilerButton.visible).ok('Reset profiler button not appeared');
    // Get the last log line
    const lastTimestamp = await monitorPage.monitorCommandLineTimestamp.nth(-1).textContent;
    // Click on refresh keys to get new logs
    await t.click(browserPage.refreshKeysButton);
    // Verify that Monitor is stopped when user clicks on "Stop" button
    await t.expect(monitorPage.monitorCommandLineTimestamp.nth(-1).textContent).eql(lastTimestamp, 'The last line of monitor logs not correct');

    // Run monitor
    await t.click(monitorPage.resetProfilerButton);
    await t.click(monitorPage.startMonitorButton);
    await monitorPage.checkCommandInMonitorResults('info');
    // Refresh the page
    await common.reloadPage();
    // Check that monitor is closed
    await t.expect(monitorPage.monitorArea.exists).notOk('Monitor area not found');
    // Verify that when user refreshes the page the list of results in Monitor is not saved
    await t.click(monitorPage.expandMonitor);
    await t.expect(monitorPage.monitorWarningMessage.exists).ok('Warning message in monitor not found');

    // Run monitor
    await t.click(monitorPage.startMonitorButton);
    await monitorPage.checkCommandInMonitorResults('info');
    // Click on refresh keys to get new logs
    await t.click(browserPage.refreshKeysButton);
    // Get last timestamp
    const lastTimestampSelector = monitorPage.monitorCommandLineTimestamp.nth(-1);
    // Stop Monitor
    await monitorPage.stopMonitor();
    // Click on Clear button
    await t.click(monitorPage.clearMonitorButton);
    // Verify that when user clicks on "Clear" button in Monitor, all commands history is removed
    await t.expect(lastTimestampSelector.exists).notOk('Cleared last line not found');
});
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
        await t.click(myRedisDatabasePage.settingsButton);
        await t.click(settingsPage.accordionAdvancedSettings);
        await settingsPage.changeKeysToScanValue('20000000');
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneBigConfig.databaseName);
    })
    .after(async t => {
        await t.click(myRedisDatabasePage.settingsButton);
        await t.click(settingsPage.accordionAdvancedSettings);
        await settingsPage.changeKeysToScanValue('10000');
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Verify that user can see monitor results in high DB load', async t => {
        // Run monitor
        await monitorPage.startMonitor();
        // Search by not existed key pattern
        await browserPage.searchByKeyName(`${chance.string({ length: 10 })}*`);
        // Check that the last child is updated
        for (let i = 0; i <= 10; i++) {
            const previousTimestamp = await monitorPage.monitorCommandLineTimestamp.nth(-1).textContent;
            await t.wait(5500);
            const nextTimestamp = await monitorPage.monitorCommandLineTimestamp.nth(-1).textContent;
            await t.expect(previousTimestamp).notEql(nextTimestamp, 'Monitor results not correct');
        }
    });
// Skipped due to redis issue https://redislabs.atlassian.net/browse/RI-4111
test.skip
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await cliPage.sendCommandInCli('acl setuser noperm nopass on +@all ~* -monitor -client');
        // Check command result in CLI
        await t.click(cliPage.cliExpandButton);
        await t.expect(cliPage.cliOutputResponseSuccess.textContent).eql('"OK"', 'Command from autocomplete was not found & executed');
        await t.click(cliPage.cliCollapseButton);
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await addNewStandaloneDatabaseApi(ossStandaloneNoPermissionsConfig);
        await common.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneNoPermissionsConfig.databaseName);
    })
    .after(async t => {
        // Delete created user
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await cliPage.sendCommandInCli('acl DELUSER noperm');
        // Delete database
        await deleteStandaloneDatabasesApi([ossStandaloneConfig, ossStandaloneNoPermissionsConfig]);
    })('Verify that if user doesn\'t have permissions to run monitor, user can see error message', async t => {
        const command = 'CLIENT LIST';
        // Expand the Profiler
        await t.click(monitorPage.expandMonitor);
        // Click on run monitor button
        await t.click(monitorPage.startMonitorButton);
        // Check that error message is displayed
        await t.expect(monitorPage.monitorNoPermissionsMessage.visible).ok('Error message not found');
        // Check the error message text
        await t.expect(monitorPage.monitorNoPermissionsMessage.innerText).eql('The Profiler cannot be started. This user has no permissions to run the \'monitor\' command', 'No Permissions message not found');
        // Verify that if user doesn't have permissions to run monitor, run monitor button is not available
        await t.expect(monitorPage.runMonitorToggle.withAttribute('disabled').exists).ok('No permissions run icon not found');
        await t.click(myRedisDatabasePage.workbenchButton);
        await workbenchPage.sendCommandInWorkbench(command);
        // Verify that user have the following error when there is no permission to run the CLIENT LIST: "NOPERM this user has no permissions to run the 'CLIENT LIST' command or its subcommand"
        await workbencActions.verifyClientListErrorMessage();
    });
