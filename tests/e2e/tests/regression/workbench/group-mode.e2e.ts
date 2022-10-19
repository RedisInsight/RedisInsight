import { Selector } from 'testcafe';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const counter = 7;
const command = 'info';
const commands = ['set key test', 'get key', 'del key'];
const commandsResult = ['OK', 'test', '1'];
const commandsNumber = commands.length;
const commandsString = commands.join('\n');

fixture `Workbench Group Mode`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can run the commands from the Editor in the group mode', async t => {
    await t.click(workbenchPage.groupMode);
    // Verify that user can run a command with quantifier and see results in group(10 info)
    await workbenchPage.sendCommandInWorkbench(`${counter} ${command}`);
    // Verify that user can see number of total commands in group, success commands, number of failed commands in header summary in Workbench
    await t.expect(workbenchPage.queryCardCommand.textContent).eql(`${counter} Command(s) - ${counter} success, 0 error(s)`, 'Not valid summary');
    // Verify that user can see full list of commands with results run in group
    await t.expect(workbenchPage.queryTextResult.find(workbenchPage.cssWorkbenchCommandInHistory).withText(`> ${command}`).count).eql(counter, 'Number of commands is not correct');
    await t.expect(workbenchPage.queryTextResult.find(workbenchPage.cssWorkbenchCommandSuccessResultInHistory).count).eql(counter, 'Number of command result is not correct');
    // Verify that if the only one command is executed in group, the result will be displayed as for group mode
    await workbenchPage.sendCommandInWorkbench(`${command}`);
    await t.expect(workbenchPage.queryCardCommand.textContent).eql('1 Command(s) - 1 success, 0 error(s)', 'Not valid summary for 1 command');
    // Turn off group mode
    await t.click(workbenchPage.groupMode);
    await workbenchPage.sendCommandInWorkbench(commandsString);
    await t.expect(workbenchPage.queryCardCommand.textContent).notEql(`${commandsNumber} Command(s) - ${commandsNumber} success, 0 error(s)`, 'Commands are sent in groups');
    for (let i = 0; i++; i < commandsNumber) {
        await workbenchPage.checkWorkbenchCommandResult(command[i], commandsResult[i], i);
    }
});
// Skip due to testcafe doesn't work with clipboard buffer. Need to add client function to check this test
test.skip('Verify that when user clicks on copy icon for group result, all commands are copied', async t => {
    await t.click(workbenchPage.groupMode);
    await workbenchPage.sendCommandInWorkbench(`${commandsString}`); // 3 commands are sent in group mode
    // Copy commands from group result
    await t.click(workbenchPage.copyCommand);
    await t.rightClick(workbenchPage.queryInputScriptArea);
    await t.click(Selector('span').withAttribute('aria-label', 'Paste'));
    await t.pressKey('ctrl+enter');
    await t.expect(workbenchPage.queryCardCommand.textContent).eql(`${commandsNumber} Command(s) - ${commandsNumber} success, 0 error(s)`, 'Not valid summary');
});
test('Verify that user can see group results in full mode', async t => {
    await t.click(workbenchPage.groupMode);
    await workbenchPage.sendCommandInWorkbench(`${commandsString}`); // 3 commands are sent in group mode
    // Open full mode
    await t.click(workbenchPage.fullScreenButton);
    await t.expect(workbenchPage.queryCardCommand.textContent).eql(`${commandsNumber} Command(s) - ${commandsNumber} success, 0 error(s)`, 'Not valid summary');
    await t.expect(workbenchPage.queryTextResult.find(workbenchPage.cssWorkbenchCommandInHistory).withText('> ').count).eql(commandsNumber, 'Number of commands is not correct');
    await t.expect(workbenchPage.queryTextResult.find(workbenchPage.cssWorkbenchCommandSuccessResultInHistory).count).eql(commandsNumber, 'Number of command result is not correct');
});
