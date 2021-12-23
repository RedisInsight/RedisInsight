import { addNewStandaloneDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, UserAgreementPage, AddRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const commandForSend1 = 'info';
const commandForSend2 = 'FT._LIST';

fixture `Command results at Workbench`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async t => {
        //Drop index and documents
        await workbenchPage.sendCommandInWorkbench('FT.DROPINDEX products DD');
    })
test('Verify that user can see re-run icon near the already executed command and re-execute the command by clicking on the icon in Workbench page', async t => {
    //Send commands
    await workbenchPage.sendCommandInWorkbench(commandForSend1);
    await workbenchPage.sendCommandInWorkbench(commandForSend2);
    //Verify that re-run icon is displayed
    await t.expect(await workbenchPage.reRunCommandButton.visible).ok('Re-run icon is displayed');
    //Re-run the last command in results
    const containerOfCommand = await workbenchPage.getCardContainerByCommand(commandForSend1);
    await t.click(containerOfCommand.find(workbenchPage.cssReRunCommandButton));
    //Verify that command is re-executed
    await t.expect(workbenchPage.queryCardCommand.textContent).eql(commandForSend1, 'The command is re-executed');
});
test('Verify that user can see expanded result after command re-run at the top of results table in Workbench', async t => {
    //Send commands
    await workbenchPage.sendCommandInWorkbench(commandForSend1);
    await workbenchPage.sendCommandInWorkbench(commandForSend2);
    //Re-run the last command in results
    const containerOfCommand = await workbenchPage.getCardContainerByCommand(commandForSend1);
    await t.click(containerOfCommand.find(workbenchPage.cssReRunCommandButton));
    //Verify that re-executed command is expanded
    await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryCardOutputResponseSuccess).visible).ok('Re-executed command is expanded');
    //Verify that re-executed command is at the top of results
    await t.expect(workbenchPage.queryCardCommand.nth(0).textContent).eql(commandForSend1, 'The re-executed command is at the top of results table');
});
test('Verify that user can delete command with result from table with results in Workbench', async t => {
    //Send command
    await workbenchPage.sendCommandInWorkbench(commandForSend1);
    //Delete the command from results
    const containerOfCommand = await workbenchPage.getCardContainerByCommand(commandForSend1);
    await t.click(containerOfCommand.find(workbenchPage.cssDeleteCommandButton));
    //Verify that deleted command is not in results
    await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend1).exists).notOk(`Command ${commandForSend1} is deleted from table with results`);
});
test('Verify that user can see the results found in the table view by default for FT.INFO, FT.SEARCH and FT.AGGREGATE', async t => {
    const commands = [
        'FT.INFO',
        'FT.SEARCH',
        'FT.AGGREGATE'
    ];
    //Send commands and check table view is default
    for(const command of commands) {
        await workbenchPage.sendCommandInWorkbench(command);
        await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssTableViewTypeOption).visible).ok(`The table view is selected by default for command ${command}`);
    }
});
