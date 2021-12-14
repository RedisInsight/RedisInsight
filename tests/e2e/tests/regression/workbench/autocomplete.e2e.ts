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
    .meta({type: 'regression'})
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
test('Verify that user can open the "read more" about the command by clicking on the ">" icon or "ctrl+space"', async t => {
    const command = 'HSET'
    const commandDetails = [
      'HSET key field value [field value ...]',
      'Set the string value of a hash field',
      'Arguments:',
      'required key',
      'multiple field value'
    ];
    //Type command
    await t.typeText(workbenchPage.queryInput, command, { replace: true });
    //Open the read more by clicking on the "ctrl+space" and check
    await t.pressKey('ctrl+space');
    await t.expect(await workbenchPage.monacoCommandDetails.exists).ok('The "read more" about the command is opened');
    for(const detail of commandDetails) {
        await t.expect(await workbenchPage.monacoCommandDetails.textContent).contains(detail, `The ${detail} command detail is displayed`)
    }
    //Close the command details
    await t.pressKey('ctrl+space');
    await t.expect(await workbenchPage.monacoCommandDetails.exists).notOk('The "read more" about the command is closed');
});
test('Verify that user can see static list of arguments is displayed when he enters the command in Editor in Workbench', async t => {
    const command = 'AI.SCRIPTEXECUTE'
    //Type the command in Editing area
    await t.typeText(workbenchPage.queryInput, command, { replace: true });
    //Check that no hints are displayed
    await t.expect(workbenchPage.monacoHintWithArguments.visible).notOk('Hints with arguments are not displayed yet')
    //Add space after the printed command
    const command_hint = 'AI.SCRIPTEXECUTE '
    await t.typeText(workbenchPage.queryInput, command_hint, { replace: true })
    //Check that hint with arguments are displayed
    await t.expect(workbenchPage.monacoHintWithArguments.visible).ok('Hints with arguments are displayed')
});
test('Verify that user can close the static list of arguments by pressing “ESC”', async t => {
    const command = 'TS.DELETERULE '
    await t.typeText(workbenchPage.queryInput, command, { replace: true })
    //Check that hint with arguments are displayed
    await t.expect(workbenchPage.monacoHintWithArguments.visible).ok('Hints with arguments are displayed')
    //Remove hints with arguments
    await t.pressKey('esc');
    //Check no hints are displayed
    await t.expect(workbenchPage.monacoHintWithArguments.visible).notOk('Hints with arguments are not displayed')
});
test('Verify that user can see the static list of arguments when he uses “Ctrl+Shift+Space” combination for already entered command for Windows', async t => {
    const command = 'JSON.ARRAPPEND'
    await t.typeText(workbenchPage.queryInput, command, { replace: true });
    //Verify that the list with auto-suggestions is displayed
    await t.expect(await workbenchPage.monacoSuggestion.exists).ok('Auto-suggestions are displayed');
    //Select the command from suggestion list
    await t.pressKey('enter');
    //Check that the command is displayed in Editing area after selecting
    const script = await workbenchPage.queryInputScriptArea.textContent;
    await t.expect(script.replace(/\s/g, ' ')).eql('JSON.ARRAPPEND key value ', 'Result of sent command exists');
    //Check that hint with arguments are displayed
    await t.expect(workbenchPage.monacoHintWithArguments.visible).ok('Hints with arguments are displayed')
    //Remove hints with arguments
    await t.pressKey('esc');
    //Check no hints are displayed
    await t.expect(workbenchPage.monacoHintWithArguments.visible).notOk('Hints with arguments are not displayed')
    //Check that using shortcut “Ctrl+Shift+Space” hints are displayed
    await t.pressKey('ctrl+shift+space');
    await t.expect(workbenchPage.monacoHintWithArguments.visible).ok('Hints with arguments are displayed')
});
