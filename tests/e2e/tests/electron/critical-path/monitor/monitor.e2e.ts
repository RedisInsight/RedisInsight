import { DatabaseHelper } from '../../../../helpers/database';
import {
    MyRedisDatabasePage,
    WorkbenchPage,
    BrowserPage
} from '../../../../pageObjects';
import { commonUrl, ossStandaloneForSSHConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

const keyName = `${Common.generateWord(20)}-key`;
const keyValue = `${Common.generateWord(10)}-value`;

const sshParams = {
    sshHost: '172.31.100.245',
    sshPort: '2222',
    sshUsername: 'u'
};

const sshWithPass = {
    ...sshParams,
    sshPassword: 'pass'
};

const sshDbPass = {
    ...ossStandaloneForSSHConfig,
    databaseName: `SSH_${Common.generateWord(5)}`
};

fixture `Monitor`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await myRedisDatabasePage.AddRedisDatabase.addStandaloneSSHDatabase(sshDbPass, sshWithPass);
        await myRedisDatabasePage.clickOnDBByName(sshDbPass.databaseName);
    })
    .afterEach(async() => {
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneForSSHConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneForSSHConfig);
    });
test('Verify that user can work with Monitor', async t => {
    const command = 'set';
    //Verify that user can open Monitor
    await t.click(browserPage.Profiler.expandMonitor);
    //Check that monitor is opened
    await t.expect(browserPage.Profiler.monitorArea.exists).ok('Profiler area');
    await t.expect(browserPage.Profiler.startMonitorButton.exists).ok('Start profiler button');
    //Verify that user can see message inside Monitor "Running Monitor will decrease throughput, avoid running it in production databases." when opens it for the first time
    await t.expect(browserPage.Profiler.monitorWarningMessage.exists).ok('Profiler warning message');
    await t.expect(browserPage.Profiler.monitorWarningMessage.withText('Running Profiler will decrease throughput, avoid running it in production databases.').exists).ok('Profiler warning message is not correct');
    //Verify that user can run Monitor by clicking "Run" command in the message inside Monitor
    await t.click(browserPage.Profiler.startMonitorButton);
    await t.expect(browserPage.Profiler.monitorIsStartedText.innerText).eql('Profiler is started.');
    //Verify that user can see run commands in monitor
    await browserPage.Cli.getSuccessCommandResultFromCli(`${command} ${keyName} ${keyValue}`);
    await browserPage.Profiler.checkCommandInMonitorResults(command, [keyName, keyValue]);
});
test('Verify that user can see the list of all commands from all clients ran for this Redis database in the list of results in Monitor', async t => {
    //Define commands in different clients
    const cli_command = 'command';
    const workbench_command = 'hello';
    const common_command = 'info';
    const browser_command = 'hset';
    //Start Monitor
    await browserPage.Profiler.startMonitor();
    //Send command in CLI
    await browserPage.Cli.getSuccessCommandResultFromCli(cli_command);
    //Check that command from CLI is displayed in monitor
    await browserPage.Profiler.checkCommandInMonitorResults(cli_command);
    //Refresh the page to send command from Browser client
    await t.click(browserPage.refreshKeysButton);
    //Check the command from browser client
    await browserPage.addHashKey(keyName);
    await browserPage.Profiler.checkCommandInMonitorResults(browser_command);
    //Open Workbench page to create new client
    await t.click(browserPage.NavigationPanel.workbenchButton);
    //Send command in Workbench
    await workbenchPage.sendCommandInWorkbench(workbench_command);
    //Check that command from Workbench is displayed in monitor
    await workbenchPage.Profiler.checkCommandInMonitorResults(workbench_command);
    //Check the command from common client
    await workbenchPage.Profiler.checkCommandInMonitorResults(common_command);
});
