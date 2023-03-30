import { rte } from '../../../helpers/constants';
import { acceptTermsAddDatabaseOrConnectToRedisStack, deleteDatabase } from '../../../helpers/database';
import { CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const cliPage = new CliPage();

const COMMAND_APPEND = 'APPEND';
const COMMAND_GROUP_SET = 'Set';

fixture `CLI Command helper`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptTermsAddDatabaseOrConnectToRedisStack(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that user can search per command in Command Helper and see relevant results', async t => {
    const commandForSearch = 'ADD';

    // Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    // Search per command
    await t.typeText(cliPage.cliHelperSearch, commandForSearch, { replace: true, paste: true });
    // Verify results in the output
    const count = await cliPage.cliHelperOutputTitles.count;
    for(let i = 0; i < count; i++){
        await t.expect(await cliPage.cliHelperOutputTitles.textContent).contains(commandForSearch, 'Results in the output not contains searched value');
    }

    // Close Command helper
    await t.click(cliPage.closeCommandHelperButton);
    // Verify that user can close Command helper
    await t.expect(cliPage.cliHelperText.exists).notOk('Command helper');
});
test('Verify that user can select one of the commands from the list of commands described in the Groups table', async t => {
    const commandForCheck = 'SADD';

    // Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    // Select one command from list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SET);
    await t.click(cliPage.cliHelperOutputTitles.withExactText(commandForCheck));
    // Verify results
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('SADD key member [member ...]', 'Selected command information not correct');
});
test('Verify that user can click on any of searched commands in Command Helper and see details of the command', async t => {
    const commandForSearch = 'Ap';

    // Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    // Select one command from list of searched commands
    await t.typeText(cliPage.cliHelperSearch, commandForSearch, { replace: true, paste: true });
    await t.click(cliPage.cliHelperOutputTitles.withExactText(COMMAND_APPEND));
    // Verify details of the command
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('APPEND key value', 'Command name and syntax not correct');
    await t.expect(cliPage.cliHelperTitle.innerText).contains('STRING', 'Command Group badge not correct');
    await t.expect(cliPage.cliHelperSummary.innerText).contains(`Appends a string to the value of a key. Creates the key if it doesn't exist.`, 'Command summary not correct');
});
test('Verify that when user enters command, he can see Command Name, Complexity, Arguments, Summary, Group, Read more', async t => {
    const commandForSearch = 'pop';
    const commandForCheck = 'LPOP';

    // Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    // Select one command from list of searched commands
    await t.typeText(cliPage.cliHelperSearch, commandForSearch, { replace: true, paste: true });
    await t.click(cliPage.cliHelperOutputTitles.withExactText(commandForCheck));
    // Verify details of the command
    await t.expect(cliPage.cliHelperTitleArgs.innerText).eql('LPOP key [count]', 'Command Name not correct');
    await t.expect(cliPage.cliHelperComplexity.innerText).eql('Complexity:\nO(N) where N is the number of elements returned', 'Complexity not correct');
    await t.expect(cliPage.cliHelperArguments.innerText).eql('Arguments:\nRequired\nkey\nOptional\n[count]', 'Arguments not correct');
    await t.expect(cliPage.cliHelperSummary.innerText).contains('Returns the first elements in a list after removing it. Deletes the list if the last element was popped.', 'Command Summary not correct');
    await t.expect(cliPage.cliHelperTitle.innerText).contains('LIST', 'Command Group not correct');
    await t.expect(cliPage.readMoreButton.exists).ok('Read more button not displayed');
});
test('Verify that user can see that command is autocompleted in CLI with required arguments', async t => {
    const command = 'HDEL';

    // Open CLI and Helper
    await t.click(cliPage.cliExpandButton);
    await t.click(cliPage.expandCommandHelperButton);
    // Search for the command and remember arguments
    await t.typeText(cliPage.cliHelperSearch, command, { replace: true, paste: true });
    await t.click(cliPage.cliHelperOutputTitles.withExactText(command));
    const commandArgsFromCliHelper = await cliPage.cliHelperTitleArgs.innerText;
    // Enter the command in CLI
    await t.typeText(cliPage.cliCommandInput, command, { replace: true, paste: true });
    // Verify autocompleted arguments
    const commandAutocomplete = await cliPage.cliCommandAutocomplete.innerText;
    await t.expect(commandArgsFromCliHelper).contains(commandAutocomplete, 'Command autocomplete arguments not correct');
});
