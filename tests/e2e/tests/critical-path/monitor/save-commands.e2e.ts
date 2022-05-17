import * as fs from 'fs';
import * as os from 'os';
import {acceptLicenseTermsAndAddDatabase, deleteDatabase} from '../../../helpers/database';
import { MonitorPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const monitorPage = new MonitorPage();
const cliPage = new CliPage();
const tempDir = os.tmpdir();
const downloadsDir = `${process.env.USERPROFILE}/Downloads`;

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
    .meta({ rte: rte.standalone })('Verify that user can see a tooltip and toggle that allows to save Profiler log or not in the Profiler', async t => {
        const toolTip = [
            'Allows you to download the generated log file after pausing the Profiler',
            'Profiler log is saved to a file on your local machine with no size limitation. The temporary log file will be automatically rewritten when the Profiler is reset.'
        ];
        await t.click(monitorPage.expandMonitor);
        //Check the toggle and Tooltip for Save log
        await t.expect(monitorPage.saveLogSwitchButton.visible).ok('The toggle that allows to save Profiler log is displayed');
        await t.hover(monitorPage.saveLogSwitchButton);
        for(const message of toolTip){
            await t.expect(monitorPage.saveLogToolTip.textContent).contains(message, 'The toolTip for save log in Profiler is displayed');
        }
        //Check toggle state
        await t.expect(monitorPage.saveLogSwitchButton.getAttribute('aria-checked')).eql('false', 'The toggle state is OFF when opens Profiler');
    });
test
    .meta({ rte: rte.standalone })('Verify that user can see that toggle is not displayed when Profiler is started', async t => {
        //Start Monitor without save logs
        await monitorPage.startMonitor();
        //Check the toggle
        await t.expect(monitorPage.saveLogSwitchButton.visible).notOk('The toggle is not displayed when Profiler is started');
        //Restart Monitor with Save logs
        await monitorPage.stopMonitor();
        await t.click(monitorPage.resetProfilerButton);
        await t.click(monitorPage.saveLogSwitchButton);
        await t.click(monitorPage.startMonitorButton);
        //Check the toggle
        await t.expect(monitorPage.saveLogSwitchButton.visible).notOk('The toggle is not displayed when Profiler is started');
    });
//skipped due the temp file is not created after the start of profiler
test.skip
    .meta({ rte: rte.standalone })('Verify that when user switch toggle to ON and started the Profiler, temporary Log file Created and recording', async t => {
        const cli_command = 'command';
        //Remember the number of files in Temp
        const numberOfTempFiles = fs.readdirSync(tempDir).length;
        //Start Monitor with Save logs
        await monitorPage.startMonitorWithSaveLog();
        //Send command in CLI
        await cliPage.getSuccessCommandResultFromCli(cli_command);
        await monitorPage.checkCommandInMonitorResults(cli_command);
        //Verify that temporary Log file Created
        await t.expect(numberOfTempFiles).gt(fs.readdirSync(tempDir).length, 'The temporary Log file is created');
    });
test
    .meta({ rte: rte.standalone })('Verify that when user switch toggle to OFF and started the Profiler, temporary Log file is not Created and recording', async t => {
        //Remember the number of files in Temp
        const numberOfTempFiles = fs.readdirSync(tempDir).length;
        //Start Monitor with Save logs
        await monitorPage.startMonitor();
        //Verify that temporary Log file is not created
        await t.expect(numberOfTempFiles).lte(fs.readdirSync(tempDir).length, 'The temporary Log file is not created');
    });
test
    .meta({ rte: rte.standalone })('Verify the Profiler Button panel when toggle was switched to ON and user pauses/resumes the Profiler', async t => {
        //Start Monitor with Save logs
        await monitorPage.startMonitorWithSaveLog();
        //Pause the Profiler
        await t.click(monitorPage.runMonitorToggle);
        //Check the panel
        await t.expect(monitorPage.downloadLogPanel.visible).ok('The download log panel appears');
        await t.expect(monitorPage.resetProfilerButton.visible).ok('The Reset Profiler button visibility');
        await t.expect(monitorPage.downloadLogButton.visible).ok('The Download button visibility');
    });
test
    .meta({ rte: rte.standalone })('Verify that when user see the toggle is OFF - Profiler logs are not being saved', async t => {
        //Remember the number of files in Temp
        const numberOfDownloadFiles = fs.readdirSync(downloadsDir).length;
        //Start Monitor without Save logs
        await monitorPage.startMonitor();
        //Check the download files
        await t.expect(numberOfDownloadFiles).eql(fs.readdirSync(downloadsDir).length, 'The Profiler logs are not being saved');
    });
test
    .meta({ rte: rte.standalone })('Verify that when user see the toggle is ON - Profiler logs are being saved', async t => {
        //Remember the number of files in Temp
        const numberOfDownloadFiles = fs.readdirSync(downloadsDir).length;
        //Start Monitor with Save logs
        await monitorPage.startMonitorWithSaveLog();
        //Download logs and check result
        await monitorPage.stopMonitor();
        await t.click(monitorPage.downloadLogButton);
        await t.expect(numberOfDownloadFiles).gt(fs.readdirSync(downloadsDir).length, 'The Profiler logs are being saved');
    });
