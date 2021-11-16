import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    WorkbenchPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

fixture `Scripting area at Workbench`
    .meta({type: 'smoke'})
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
test('Verify that user can comment out any characters in scripting area and all these characters in this raw number are not send in the request', async t => {
    const command1 = 'info';
    const command2 = 'command';
    const commandForSend = [
        '// some comment before command',
        '\n',
        command1,
        '\n',
        '// some comment between commands with slashes // ** //',
        '\n',
        `${command2} // comment in the row with command`,
        '\n',
        '// some comment after command'
    ];
    //Send command
    await workbenchPage.sendCommandInWorkbench(commandForSend.join(''));
    // Check that 2 results are shown
    await t.expect(workbenchPage.queryCardContainer.count).eql(2);
    // Check that we have results with sent commands
    const sentCommandText1 = await workbenchPage.queryCardCommand.withExactText(command1);
    await t.expect(sentCommandText1.exists).ok('Result of sent command exists');
    const sentCommandText2 = await workbenchPage.queryCardCommand.withExactText(command2);
    await t.expect(sentCommandText2.exists).ok('Result of sent command exists');
});
test('Verify that user can run multiple commands in one query in Workbench', async t => {
    const commandForSend1 = 'info';
    const commandForSend2 = 'FT._LIST';
    const multipleCommands = [
        'info',
        'command',
        'FT.SEARCH idx *'
    ];
    //Send commands
    await workbenchPage.sendCommandInWorkbench(commandForSend1);
    await workbenchPage.sendCommandInWorkbench(commandForSend2);
    //Check that all the previous run commands are saved and displayed
    await t.eval(() => location.reload());
    await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend1).exists).ok('The previous run commands are saved');
    await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend2).exists).ok('The previous run commands are saved');
    //Send multiple commands in one query
    await workbenchPage.sendCommandInWorkbench(multipleCommands.join('\n'), 0.75);
    //Check that the results for all commands are displayed
    for(const command of multipleCommands) {
        await t.expect(workbenchPage.queryCardCommand.withExactText(command).exists).ok(`The command ${command} from multiple query is displayed`);
    }
});
