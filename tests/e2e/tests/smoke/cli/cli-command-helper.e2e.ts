import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const cliPage = new CliPage();

const COMMAND_APPEND = 'APPEND';
const COMMAND_GROUP_SET = 'Set';

fixture `CLI Command helper`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await clearDatabaseInCli();
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can close Command helper', async t => {
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Close Command helper
    await t.click(cliPage.closeCommandHelperButton);
    //Verify that the Command helper is closed
    await t.expect(cliPage.cliHelperText.visible).eql(false, 'Command helper');
});
test('Verify that user can search per command in Command Helper and see relevant results', async t => {
    const commandForSearch = 'ADD';
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Search per command
    await t.typeText(cliPage.cliHelperSearch, commandForSearch);
    //Verify results in the output
    const count = await cliPage.cliHelperOutputTitles.count;
    for(let i = 0; i < count; i++){
        await t.expect(await cliPage.cliHelperOutputTitles.textContent).contains(commandForSearch, 'Results in the output contains searched value');
    }
});
test('Verify that user can select one of the commands from the list of commands described in the Groups table', async t => {
    const commandForCheck = 'SADD';
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Select one command from list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SET);
    await t.click(cliPage.cliHelperOutputTitles.withExactText(commandForCheck));
    //Verify results
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('SADD key member [member ...]', 'Selected command information');
});
test('Verify that user can click on any of searched commands in Command Helper and see details of the command', async t => {
    const commandForSearch = 'Ap';
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Select one command from list of searched commands
    await t.typeText(cliPage.cliHelperSearch, commandForSearch);
    await t.click(cliPage.cliHelperOutputTitles.withExactText(COMMAND_APPEND));
    //Verify details of the command
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('APPEND key value', 'Command name and syntax');
    await t.expect(cliPage.cliHelperTitle.innerText).contains('STRING', 'Command Group badge');
    await t.expect(cliPage.cliHelperSummary.innerText).contains('Append a value to a key Read more', 'Command summary');
});
test('Verify that when user enters command, he can see Command Name, Complexity, Arguments, Summary, Group, Read more', async t => {
    const commandForSearch = 'pop';
    const commandForCheck = 'LPOP';
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Select one command from list of searched commands
    await t.typeText(cliPage.cliHelperSearch, commandForSearch);
    await t.click(cliPage.cliHelperOutputTitles.withExactText(commandForCheck));
    //Verify details of the command
    await t.expect(cliPage.cliHelperTitleArgs.innerText).eql('LPOP key [count]', 'Command Name');
    await t.expect(cliPage.cliHelperComplexity.innerText).eql('Complexity:\nO(N) where N is the number of elements returned', 'Complexity');
    await t.expect(cliPage.cliHelperArguments.innerText).eql('Arguments:\nRequired\nkey\nOptional\n[count]', 'Arguments');
    await t.expect(cliPage.cliHelperSummary.innerText).contains('Remove and get the first elements in a list', 'Command Summary');
    await t.expect(cliPage.cliHelperTitle.innerText).contains('LIST', 'Command Group');
    await t.expect(cliPage.readMoreButton.exists).ok('Read more button');
});
test('Verify that user can see that command is autocompleted in CLI with required arguments', async t => {
    const command = 'HDEL';
    //Open CLI and Helper
    await t.click(cliPage.cliExpandButton);
    await t.click(cliPage.expandCommandHelperButton);
    //Search for the command and remember arguments
    await t.typeText(cliPage.cliHelperSearch, command);
    await t.click(cliPage.cliHelperOutputTitles.withExactText(command));
    const commandArgsFromCliHelper = await cliPage.cliHelperTitleArgs.innerText;
    //Enter the command in CLI
    await t.typeText(cliPage.cliCommandInput, command);
    //Verify autocompleted arguments
    const commandAutocomplete = await cliPage.cliCommandAutocomplete.innerText;
    await t.expect(commandArgsFromCliHelper).contains(commandAutocomplete, 'Command autocomplete arguments');
});
