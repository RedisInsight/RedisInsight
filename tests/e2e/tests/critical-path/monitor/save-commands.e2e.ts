import * as fs from 'fs';
import * as os from 'os';
import { join as joinPath } from 'path';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { MonitorPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const monitorPage = new MonitorPage();
const cliPage = new CliPage();
const tempDir = os.tmpdir();
let downloadedFilePath = '';

async function getFileDownloadPath(): Promise<string> {
    return joinPath(os.homedir(), 'Downloads');
}

async function findByFileStarts(dir: string): Promise<number> {
    if (fs.existsSync(dir)) {
        const matchedFiles: string[] = [];
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file.startsWith('test_standalone')) {
                matchedFiles.push(file);
            }
        }
        return matchedFiles.length;
    }
    return 0;
}

fixture `Save commands`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        downloadedFilePath = await getFileDownloadPath();
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see a tooltip and toggle that allows to save Profiler log or not in the Profiler', async t => {
    const toolTip = [
        'Allows you to download the generated log file after pausing the Profiler',
        'Profiler log is saved to a file on your local machine with no size limitation. The temporary log file will be automatically rewritten when the Profiler is reset.'
    ];

    await t.click(monitorPage.expandMonitor);
    // Check the toggle and Tooltip for Save log
    await t.expect(monitorPage.saveLogSwitchButton.exists).ok('The toggle that allows to save Profiler log is not displayed');
    await t.hover(monitorPage.saveLogSwitchButton);
    for (const message of toolTip) {
        await t.expect(monitorPage.saveLogToolTip.textContent).contains(message, 'The toolTip for save log in Profiler is not displayed');
    }
    // Check toggle state
    await t.expect(monitorPage.saveLogSwitchButton.getAttribute('aria-checked')).eql('false', 'The toggle state is not OFF when Profiler opened');
});
test('Verify that user can see that toggle is not displayed when Profiler is started', async t => {
    // Start Monitor without save logs
    await monitorPage.startMonitor();
    // Check the toggle
    await t.expect(monitorPage.saveLogSwitchButton.exists).notOk('The toggle is displayed when Profiler is started');
    // Restart Monitor with Save logs
    await monitorPage.stopMonitor();
    await t.click(monitorPage.resetProfilerButton);
    await t.click(monitorPage.saveLogSwitchButton);
    await t.click(monitorPage.startMonitorButton);
    // Check the toggle
    await t.expect(monitorPage.saveLogSwitchButton.exists).notOk('The toggle is displayed when Profiler is started');
});
test('Verify that when user switch toggle to ON and started the Profiler, temporary Log file Created and recording', async t => {
    const cli_command = 'command';
    // Remember the number of files in Temp
    const numberOfTempFiles = fs.readdirSync(tempDir).length;

    // Start Monitor with Save logs
    await monitorPage.startMonitorWithSaveLog();
    // Send command in CLI
    await cliPage.getSuccessCommandResultFromCli(cli_command);
    await monitorPage.checkCommandInMonitorResults(cli_command);
    // Verify that temporary Log file Created
    await t.expect(numberOfTempFiles).lt(fs.readdirSync(tempDir).length, 'The temporary Log file is not created');
});
test('Verify that when user switch toggle to OFF and started the Profiler, temporary Log file is not Created and recording', async t => {
    // Remember the number of files in Temp
    const numberOfTempFiles = fs.readdirSync(tempDir).length;

    // Start Monitor without Save logs
    await monitorPage.startMonitor();
    // Verify that temporary Log file is not created
    await t.expect(numberOfTempFiles).gte(fs.readdirSync(tempDir).length, 'The temporary Log file is created');
});
test('Verify the Profiler Button panel when toggle was switched to ON and user pauses/resumes the Profiler', async t => {
    // Start Monitor with Save logs
    await monitorPage.startMonitorWithSaveLog();
    // Pause the Profiler
    await t.click(monitorPage.runMonitorToggle);
    // Check the panel
    await t.expect(monitorPage.downloadLogPanel.exists).ok('The download log panel not appeared');
    await t.expect(monitorPage.resetProfilerButton.exists).ok('The Reset Profiler button not visible');
    await t.expect(monitorPage.downloadLogButton.exists).ok('The Download button not visible');
});
test('Verify that when user see the toggle is OFF - Profiler logs are not being saved', async t => {
    // Remember the number of files in Temp
    const numberOfDownloadFiles = await findByFileStarts(downloadedFilePath);

    // Start Monitor without Save logs
    await monitorPage.startMonitor();
    await t.wait(3000);
    // Check the download files
    await t.expect(await findByFileStarts(downloadedFilePath)).eql(numberOfDownloadFiles, 'The Profiler logs are saved');
});
// Skipped due to testCafe issue https://github.com/DevExpress/testcafe/issues/5574
test.skip('Verify that when user see the toggle is ON - Profiler logs are being saved', async t => {
    // Remember the number of files in Temp
    const numberOfDownloadFiles = await findByFileStarts(downloadedFilePath);

    // Start Monitor with Save logs
    await monitorPage.startMonitorWithSaveLog();
    // Download logs and check result
    await monitorPage.stopMonitor();
    await t.click(monitorPage.downloadLogButton);
    await t.expect(await findByFileStarts(downloadedFilePath)).gt(numberOfDownloadFiles, 'The Profiler logs not saved', { timeout: 5000 });
});
