import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    CliPage,
    MonitorPage,
    WorkbenchPage,
    BrowserPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { Chance } from 'chance';

const myRedisDatabasePage = new MyRedisDatabasePage();
const cliPage = new CliPage();
const monitorPage = new MonitorPage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();
const chance = new Chance();

const keyName = `${chance.word({ length: 20 })}-key`;
const keyValue = `${chance.word({ length: 10 })}-value`;

fixture `Monitor`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can work with Monitor', async t => {
        const command = 'set';
        //Verify that user can open Monitor
        await t.click(monitorPage.expandMonitor);
        //Check that monitor is opened
        await t.expect(monitorPage.monitorArea.exists).ok('Profiler area');
        await t.expect(monitorPage.startMonitorButton.exists).ok('Start profiler button');
        //Verify that user can see message inside Monitor "Running Monitor will decrease throughput, avoid running it in production databases." when opens it for the first time
        await t.expect(monitorPage.monitorWarningMessage.exists).ok('Profiler warning message');
        await t.expect(monitorPage.monitorWarningMessage.withText('Running Profiler will decrease throughput, avoid running it in production databases').exists).ok('Profiler warning message is correct');
        //Verify that user can run Monitor by clicking "Run" command in the message inside Monitor
        await t.click(monitorPage.startMonitorButton);
        await t.expect(monitorPage.monitorIsStartedText.innerText).eql('Profiler is started.');
        //Verify that user can see run commands in monitor
        await cliPage.getSuccessCommandResultFromCli(`${command} ${keyName} ${keyValue}`);
        await monitorPage.checkCommandInMonitorResults(command, [keyName, keyValue]);
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see the list of all commands from all clients ran for this Redis database in the list of results in Monitor', async t => {
        //Define commands in different clients
        const cli_command = 'command';
        const workbench_command = 'hello';
        const common_command = 'info';
        const browser_command = 'dbsize';
        //Expand Monitor panel
        await t.click(monitorPage.expandMonitor);
        //Start monitor (using run button in header)
        await t.click(monitorPage.runMonitorToggle);
        //Send command in CLI
        await cliPage.getSuccessCommandResultFromCli(cli_command);
        //Check that command from CLI is displayed in monitor
        await monitorPage.checkCommandInMonitorResults(cli_command);
        //Refresh the page to send command from Browser client
        await t.click(browserPage.refreshKeysButton);
        //Check the command from browser client
        await monitorPage.checkCommandInMonitorResults(browser_command);
        //Open Workbench page to create new client
        await t.click(myRedisDatabasePage.workbenchButton);
        //Send command in Workbench
        await workbenchPage.sendCommandInWorkbench(workbench_command);
        //Check that command from Workbench is displayed in monitor
        await monitorPage.checkCommandInMonitorResults(workbench_command);
        //Check the command from common client
        await monitorPage.checkCommandInMonitorResults(common_command);
    });
