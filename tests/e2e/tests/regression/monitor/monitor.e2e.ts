import { Chance } from 'chance';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    MonitorPage,
    SettingsPage,
    BrowserPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte, env } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const monitorPage = new MonitorPage();
const settingsPage = new SettingsPage();
const browserPage = new BrowserPage();
const chance = new Chance();

fixture `Monitor`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that when user closes the Monitor by clicking on "Close Monitor" button Monitor stopped', async t => {
        //Run monitor
        await monitorPage.startMonitor();
        //Close Monitor
        await t.click(monitorPage.closeMonitor);
        //Verify that monitor is not displayed
        await t.expect(monitorPage.monitorArea.visible).notOk('Profiler area');
        //Verify that user open monitor again
        await t.click(monitorPage.expandMonitor);
        //Verify that when user reopens Monitor history is not displayed
        await t.expect(monitorPage.startMonitorButton.visible).ok('Start profiler button');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that Monitor is stopped when user clicks on "Stop" button', async t => {
        //Run monitor
        await monitorPage.startMonitor();
        //Click on Stop Monitor button
        await t.click(monitorPage.runMonitorToggle);
        //Check for "Monitor is stopped." text
        await t.expect(monitorPage.monitorIsStoppedText.innerText).eql('Profiler is stopped.');
        //Check that no commands are displayed after "Monitor is stopped" text
        await t.expect(monitorPage.monitorIsStoppedText.nextSibling().exists).notOk('No commands in monitor');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that when user refreshes the page the list of results in Monitor is not saved', async t => {
        //Run monitor
        await monitorPage.startMonitor();
        //Refresh the page
        await t.eval(() => location.reload());
        //Check that monitor is closed
        await t.expect(monitorPage.monitorArea.exists).notOk('Monitor area');
        //Check that monitor area doesn't have any saved results
        await t.click(monitorPage.expandMonitor);
        await t.expect(monitorPage.monitorWarningMessage.exists).ok('Warning message in monitor');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that when user clicks on "Clear" button in Monitor, all commands history is removed', async t => {
        //Run monitor
        await monitorPage.startMonitor();
        //Stop Monitor
        await monitorPage.stopMonitor();
        //Click on Clear button
        await t.click(monitorPage.clearMonitorButton);
        //Check that monitor has start screen
        await t.expect(monitorPage.startMonitorButton.exists).ok('Start monitor button');
    });
test
    .meta({ rte: rte.standalone })
    .before(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
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
        //Delete database
        await deleteDatabase(ossStandaloneBigConfig.databaseName);
    })
    ('Verify that user can see monitor results in high DB load', async t => {
        //Run monitor
        await monitorPage.startMonitor();
        //Search by not existed key pattern
        await browserPage.searchByKeyName(`${chance.string({ length:10 })}*`);
        //Check that the last child is updated
        for (let i = 0; i <= 10; i++) {
            const previousTimestamp = await monitorPage.monitorCommandLineTimestamp.nth(-1).textContent;
            await t.wait(5500);
            const nextTimestamp = await monitorPage.monitorCommandLineTimestamp.nth(-1).textContent;
            await t.expect(previousTimestamp).notEql(nextTimestamp);
        }
    });
