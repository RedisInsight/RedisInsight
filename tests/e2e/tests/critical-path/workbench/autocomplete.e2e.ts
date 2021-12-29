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

fixture `Autocomplete for entered commands`
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
test('Verify that user can select a command from the list with auto-suggestions when type in any character in the Editor', async t => {
    //Start type characters and select command
    await t.typeText(workbenchPage.queryInput, 'AC', { replace: true });
    //Verify that the list with auto-suggestions is displayed
    await t.expect(await workbenchPage.monacoSuggestion.exists).ok('Auto-suggestions are displayed');
    //Select command and check result
    await t.pressKey('enter');
    const script = await workbenchPage.queryInputScriptArea.textContent;
    await t.expect(script.replace(/\s/g, ' ')).eql('ACL ', 'Result of sent command exists');
});
test('Verify that when user have selected a command (via “Enter” from the list of auto-suggested commands), user can see the required arguments inserted to the Editor', async t => {
    const command = 'LINDEX'
    const commandArguments = [
        'key',
        'index'
    ];
    //Select command via Enter
    await t.typeText(workbenchPage.queryInput, command, { replace: true });
    await t.pressKey('enter');
    //Check the required arguments inserted
    const script = await workbenchPage.queryInputScriptArea.textContent;
    for(let argument of commandArguments) {
        await t.expect(script).contains(argument, `The required argument ${argument} is inserted`);
    }
});
test('Verify that user can change any required argument inserted', async t => {
    const command = 'HMGET'
    const commandArguments = [
        'key',
        'field'
    ];
    const commandArgumentsForChange = [
        'firstArgument',
        'secondArgument'
    ];
    //Select command via Enter
    await t.typeText(workbenchPage.queryInput, command, { replace: true });
    await t.pressKey('enter');
    //Change required arguments
    const scriptBeforeEdit = await workbenchPage.queryInputScriptArea.textContent;
    await t.typeText(workbenchPage.queryInput, commandArgumentsForChange[0]);
    await t.pressKey('tab');
    await t.typeText(workbenchPage.queryInput, commandArgumentsForChange[1]);
    const scriptAfterEdit = await workbenchPage.queryInputScriptArea.textContent;
    //Verify the command after changes
    await t.expect(scriptBeforeEdit).notEql(scriptAfterEdit, `The required arguments are editable`);
    for(let argument of commandArguments) {
        await t.expect(scriptAfterEdit).notContains(argument, `The argument ${argument} is changed`);
    }
});
test('Verify that the list of optional arguments will not be inserted with autocomplete', async t => {
    const command = 'ZPOPMAX'
    const commandRequiredArgument = 'key';
    const commandOptionalArgument = 'count';
    //Select command via Enter
    await t.typeText(workbenchPage.queryInput, command, { replace: true });
    await t.pressKey('enter');
    //Verify the command arguments inserted
    const script = await workbenchPage.queryInputScriptArea.textContent;
    await t.expect(script).contains(commandRequiredArgument, `The required argument is inserted`);
    await t.expect(script).notContains(commandOptionalArgument, `The optional argument is not inserted`);
});
