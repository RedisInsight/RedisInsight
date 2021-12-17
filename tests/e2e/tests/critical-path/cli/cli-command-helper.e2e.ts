import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const cliPage = new CliPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

const defaultHelperText = 'Enter any command in CLI or use search to see detailed information.';
const COMMAND_APPEND = 'APPEND';
const COMMAND_GROUP_SET = 'Set';
const COMMAND_GROUP_TIMESERIES = 'TimeSeries';
const COMMAND_GROUP_GRAPH = 'Graph';

fixture `CLI Command helper`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
test('Verify that user can see relevant search results in Command Helper per every entered symbol', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Start search from 1 symbol
    await t.typeText(cliPage.cliHelperSearch, 's');
    //Verify that we found commands
    await t.expect(cliPage.cliHelperOutputTitles.count).gt(0, 'List of commands were found');
    const countCommandsOfOneLetterSearch = await cliPage.cliHelperOutputTitles.count;
    //Continue typing
    await t.typeText(cliPage.cliHelperSearch, 'e');
    const countCommandsOfTwoLettersSearch = await cliPage.cliHelperOutputTitles.count;
    //Verify that first list has more count than the second
    await t.expect(countCommandsOfOneLetterSearch).gt(countCommandsOfTwoLettersSearch, 'Count of commands with 1 letter more than 2');
});
test('Verify that when user clears the input in the Search of CLI Helper (via x icon), he can see the default screen with proper the text', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Verify default text
    await t.expect(cliPage.cliHelperText.textContent).eql(defaultHelperText, 'Default text for CLI Helper is shown');
    //Search any command
    await t.typeText(cliPage.cliHelperSearch, 'SET');
    await t.expect(cliPage.cliHelperOutputTitles.count).gt(0, 'List of commands were found');
    //Clear search input
    const clearButton = cliPage.cliHelper.find('[aria-label="Clear input"]');
    await t.click(clearButton);
    //Verify default text after clear
    await t.expect(cliPage.cliHelperText.textContent).eql(defaultHelperText, 'Default text for CLI Helper is shown');
});
test('Verify that when user enters command in CLI, Helper displays additional info about the command', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open CLI and Helper
    await t.click(cliPage.cliExpandButton);
    await t.click(cliPage.expandCommandHelperButton);
    //Enter command into CLI
    await t.typeText(cliPage.cliCommandInput, COMMAND_APPEND);
    //Verify details of the command
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('APPEND key value', 'Command name and syntax');
    await t.expect(cliPage.cliHelperTitle.innerText).contains('STRING', 'Command Group badge');
    await t.expect(cliPage.cliHelperSummary.innerText).contains('Append a value to a key', 'Command summary');
});
test('Verify that Command helper cleared when user runs the command in CLI', async t => {
    const searchText = 'sa';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open CLI and Helper
    await t.click(cliPage.cliExpandButton);
    await t.click(cliPage.expandCommandHelperButton);
    //Select group from list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SET);
    //Type text in search
    await t.typeText(cliPage.cliHelperSearch, searchText, { speed: 0.5 });
    //Enter command into CLI
    await t.typeText(cliPage.cliCommandInput, COMMAND_APPEND, { speed: 0.5 });
    //Verify that CLI Helper Search & Filter were cleared
    await t.expect(cliPage.filterGroupTypeButton.textContent).notContains(COMMAND_GROUP_SET, 'Filter was cleared');
    await t.expect(cliPage.cliHelperSearch.value).eql('', 'Search was cleared');
});
test('Verify that user can unselect the command filtered to remove filters', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Select one command from list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SET);
    await t.expect(cliPage.cliHelperOutputTitles.count).gt(0, 'List of commands were found');
    //Unselect previous command from list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SET);
    //Verify that no any commands are shown
    await t.expect(cliPage.cliHelperOutputTitles.count).eql(0, 'List of commands were cleared');
    //Verify default text after clear
    await t.expect(cliPage.cliHelperText.textContent).eql(defaultHelperText, 'Default text for CLI Helper is shown');
});
test('Verify that when user has used search and apply filters, search results include only commands from the filter group applied', async t => {
    const searchText = 'sa';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Select group from list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SET);
    //Type text in search
    await t.typeText(cliPage.cliHelperSearch, searchText, { speed: 0.5 });
    //Check that no another commands were found
    await t.expect(cliPage.cliHelperOutputTitles.withText('SAVE').exists).notOk('No command found from another group');
    //Check that command from 'Set' group was found
    await t.expect(cliPage.cliHelperOutputTitles.withText('SADD').exists).ok('Proper command was found');
});
test('Verify that user can type TS. in Command helper and see commands from RedisTimeSeries commands.json', async t => {
    const commandForSearch = 'TS.';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Select group from list and remeber commands
    await cliPage.selectFilterGroupType(COMMAND_GROUP_TIMESERIES);
    const commandsFilterCount = await cliPage.cliHelperOutputTitles.count;
    let timeSeriesCommands = [];
    for(let i = 0; i < commandsFilterCount; i++) {
        timeSeriesCommands.push(await cliPage.cliHelperOutputTitles.nth(i).textContent);
    }
    //Unselect group from list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_TIMESERIES);
    //Search per command
    await t.typeText(cliPage.cliHelperSearch, commandForSearch);
    //Verify results in the output
    const commandsCount = await cliPage.cliHelperOutputTitles.count;
    for(let i = 0; i < commandsCount; i++){
        await t.expect(cliPage.cliHelperOutputTitles.nth(i).textContent).eql(timeSeriesCommands[i], 'Results in the output contains searched value');
    }
});
test('Verify that user can type GRAPH. in Command helper and see auto-suggestions from RedisGraph commands.json', async t => {
    const commandForSearch = 'GRAPH.';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    //Select group from list and remeber commands
    await cliPage.selectFilterGroupType(COMMAND_GROUP_GRAPH);
    const commandsFilterCount = await cliPage.cliHelperOutputTitles.count;
    let graphCommands = [];
    for(let i = 0; i < commandsFilterCount; i++) {
        graphCommands.push(await cliPage.cliHelperOutputTitles.nth(i).textContent);
    }
    //Unselect group from list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_GRAPH);
    //Search per command
    await t.typeText(cliPage.cliHelperSearch, commandForSearch);
    //Verify results in the output
    const commandsCount = await cliPage.cliHelperOutputTitles.count;
    for(let i = 0; i < commandsCount; i++){
        await t.expect(cliPage.cliHelperOutputTitles.nth(i).textContent).eql(graphCommands[i], 'Results in the output contains searched value');
    }
});
