import * as fs from 'fs';
import * as os from 'os';
import {acceptLicenseTermsAndAddDatabase, deleteDatabase} from '../../../helpers/database';
import { MonitorPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const monitorPage = new MonitorPage();
const tempDir = os.tmpdir();

fixture `Save commands`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test
    .meta({ rte: rte.standalone })('Verify that when clicks on “Reset Profiler” button he brought back to Profiler home screen', async t => {
        //Start Monitor without Save logs
        await monitorPage.startMonitor();
        //Remember the number of files in Temp
        const numberOfTempFiles = fs.readdirSync(tempDir).length;
        //Reset profiler
        await t.click(monitorPage.runMonitorToggle);
        await t.click(monitorPage.resetProfilerButton);
        //Check the screen
        await t.expect(monitorPage.monitorNotStartedElement.visible).ok('The Profiler home screen appears');
        await t.click(monitorPage.closeMonitor);
        //Start Monitor with Save logs
        await monitorPage.startMonitorWithSaveLog();
        //Reset profiler
        await t.click(monitorPage.runMonitorToggle);
        await t.click(monitorPage.resetProfilerButton);
        //Check the screen
        await t.expect(monitorPage.monitorNotStartedElement.visible).ok('The Profiler home screen appears');
        await t.expect(monitorPage.monitorIsStartedText.visible).notOk('The current Profiler session is closed');
        //temporary Log file is deleted
        await t.expect(numberOfTempFiles).eql(fs.readdirSync(tempDir).length, 'The temporary Log file is deleted');
    });
test
    .meta({ rte: rte.standalone })('Verify that when user clears the Profiler he doesn\'t brought back to Profiler home screen', async t => {
        //Start Monitor
        await monitorPage.startMonitor();
        //Clear monitor and check the view
        await t.click(monitorPage.clearMonitorButton);
        await t.expect(monitorPage.monitorNotStartedElement.visible).notOk('Profiler home screen is not opened after Clear');
        await t.click(monitorPage.closeMonitor);
        //Start Monitor with Save logs
        await monitorPage.startMonitorWithSaveLog();
        //Clear monitor and check the view
        await t.click(monitorPage.clearMonitorButton);
        await t.expect(monitorPage.monitorNotStartedElement.visible).notOk('Profiler home screen is not opened after Clear');
    });
