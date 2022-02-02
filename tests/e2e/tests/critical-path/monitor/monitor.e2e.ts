import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    CliPage,
    MonitorPage,
    WorkbenchPage,
    BrowserPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { getRandomKeyName } from '../../../helpers/keys';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const cliPage = new CliPage();
const monitorPage = new MonitorPage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();
const keyName = `${getRandomKeyName(10)}-key`;
const keyValue = `${getRandomKeyName(10)}-value`;

fixture `Monitor`
    .meta({ type: 'critical_path' })
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
test
    .after(async t => {
        await browserPage.deleteKeyByName(keyName);
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.deleteDatabaseByName(ossStandaloneConfig.databaseName);
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
        await monitorPage.monitorWarningMessage.withText('Running Profiler will decrease throughput, avoid running it in production databases');
        //Verify that user can run Monitor by clicking "Run" command in the message inside Monitor
        await t.click(monitorPage.startMonitorButton);
        await t.expect(monitorPage.monitorIsStartedText.innerText).eql('Profiler is started.');
        //Verify that user can see run commands in monitor
        await cliPage.getSuccessCommandResultFromCli(`${command} ${keyName} ${keyValue}`);
        await monitorPage.checkCommandInMonitorResults(command, [keyName, keyValue]);
    });
test('Verify that user can see the list of all commands from all clients ran for this Redis database in the list of results in Monitor', async t => {
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
