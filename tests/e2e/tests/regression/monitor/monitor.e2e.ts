import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    MonitorPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const monitorPage = new MonitorPage();

fixture `Monitor`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    })
    .afterEach(async t => {
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.deleteDatabaseByName(ossStandaloneConfig.databaseName);
    })
test('Verify that when user closes the Monitor by clicking on "Close Monitor" button Monitor stopped', async t => {
    //Run monitor
    await monitorPage.startMonitor();
    //Close Monitor
    await t.click(monitorPage.closeMonitor);
    //Verify that monitor is not displayed
    await t.expect(monitorPage.monitorArea.visible).notOk('Monitor area');
    //Verify that user open monitor again
    await t.click(monitorPage.expandMonitor);
    //Verify that when user reopens Monitor history is not displayed
    await t.expect(monitorPage.startMonitorButton.visible).ok('Start monitor button');
});
test('Verify that Monitor is stopped when user clicks on "Stop" button', async t => {
    //Run monitor
    await monitorPage.startMonitor();
    //Click on Stop Monitor button
    await t.click(monitorPage.runMonitorToggle);
    //Check for "Monitor is stopped." text
    await t.expect(monitorPage.monitorIsStoppedText.visible).ok('Monitor is stopped text');
    //Check that no commands are displayed after "Monitor is stopped" text
    await t.expect(monitorPage.monitorIsStoppedText.nextSibling().exists).notOk('No commands in monitor');
});
test('Verify that when user refreshes the page the list of results in Monitor is not saved', async t => {
    //Run monitor
    await monitorPage.startMonitor();
    //Refresh the page
    await t.eval(() => location.reload(true));
    //Check that monitor is closed
    await t.expect(monitorPage.monitorArea.exists).notOk('Monitor area');
    //Check that monitor area doesn't have any saved results
    await t.click(monitorPage.expandMonitor);
    await t.expect(monitorPage.monitorWarningMessage.exists).ok('Warning message in monitor');
});
test('Verify that when user clicks on "Clear" button in Monitor, all commands history is removed', async t => {
    //Run monitor
    await monitorPage.startMonitor();
    //Stop Monitor
    await monitorPage.stopMonitor();
    //Click on Clear button
    await t.click(monitorPage.clearMonitorButton);
    //Check that monitor has start screen
    await t.expect(monitorPage.startMonitorButton.exists).ok('Start monitor button');
});
