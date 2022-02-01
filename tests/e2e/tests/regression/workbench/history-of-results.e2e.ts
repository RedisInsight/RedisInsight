import { getRandomParagraph } from '../../../helpers/keys';
import { acceptLicenseTermsAndAddDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();

const oneMinuteTimeout = 60000;
const command = 'set key test';

fixture `History of results at Workbench`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async(t) => {
        //Clear database
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that user can see original date and time of command execution in Workbench history after the page update', async t => {
        //Send command and remember the time
        await workbenchPage.sendCommandInWorkbench(command);
        const dateTime = await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssCommandExecutionDateTime).textContent;
        //Wait fo 1 minute, refresh page and check results
        await t.wait(oneMinuteTimeout);
        await t.eval(() => location.reload());
        await t.expect(workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssCommandExecutionDateTime).textContent).eql(dateTime, 'The original date and time of command execution is saved after the page update');
    });
//skipped due the long time execution and hangs of test
test.skip
    .meta({ rte: 'standalone' })
    ('Verify that if command result is more than 1 MB and user refreshes the page, the message "Results have been deleted since they exceed 1 MB. Re-run the command to see new results." is displayed', async t => {
        const commandToSend = 'set key';
        const commandToGet = 'get key';
        //Send command with value that exceed 1MB
        let commandText = getRandomParagraph(10).repeat(100);
        await workbenchPage.sendCommandInWorkbench(`${commandToSend} "${commandText}"`, 1, true);
        await workbenchPage.sendCommandInWorkbench(commandToGet);
        //Refresh the page and check result
        await t.eval(() => location.reload());
        await t.click(workbenchPage.queryCardContainer.withText(commandToGet));
        await t.expect(workbenchPage.queryTextResult.textContent).eql('"Results have been deleted since they exceed 1 MB. Re-run the command to see new results."', 'The messageis displayed');
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that the first command in workbench history is deleted when user executes 31 command (new the following result replaces the first result)', async t => {
        const numberOfCommands = 30;
        const firstCommand = 'FT._LIST';
        //Send command the first command
        await workbenchPage.sendCommandInWorkbench(firstCommand);
        await t.expect(workbenchPage.queryCardContainer.nth(0).textContent).contains(firstCommand, 'The first executed command is in the workbench history');
        //Send 30 commands and check the results
        await workbenchPage.sendCommandInWorkbench(`${numberOfCommands} ${command}`);
        for( let i = 0; i < numberOfCommands; i++) {
            await t.expect(workbenchPage.queryCardContainer.nth(0).textContent).contains(command, 'The command executed after the first command is displayed');
            await t.click(workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssDeleteCommandButton));
        }
        await t.expect(workbenchPage.noCommandHistoryTitle.visible).ok('The first command is deleted when user executes 31 command');
    });
