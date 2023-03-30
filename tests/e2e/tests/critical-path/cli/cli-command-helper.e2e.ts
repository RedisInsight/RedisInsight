import {env, rte} from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { CliActions } from '../../../common-actions/cli-actions';

const cliPage = new CliPage();
const cliActions = new CliActions();

const defaultHelperText = 'Enter any command in CLI or use search to see detailed information.';
const COMMAND_APPEND = 'APPEND';
const COMMAND_GROUP_SET = 'Set';
const COMMAND_GROUP_TIMESERIES = 'TimeSeries';
const COMMAND_GROUP_GRAPH = 'Graph';

fixture `CLI Command helper`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify Command Helper search and filter', async t => {
    // Open Command Helper
    await t.click(cliPage.expandCommandHelperButton);
    // Verify default text
    await t.expect(cliPage.cliHelperText.textContent).eql(defaultHelperText, 'Default text for CLI Helper is not shown');
    // Search any command
    await t.typeText(cliPage.cliHelperSearch, 'SET', { replace: true, paste: true });
    await t.expect(cliPage.cliHelperOutputTitles.count).gt(0, 'List of commands were not found');
    // Clear search input
    const clearButton = cliPage.cliHelper.find('[aria-label="Clear input"]');
    await t.click(clearButton);
    // Verify that when user clears the input in the Search of CLI Helper (via x icon), he can see the default screen with proper the text
    await t.expect(cliPage.cliHelperText.textContent).eql(defaultHelperText, 'Default text for CLI Helper is not shown');

    // Verify that user can unselect the command filtered to remove filters
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SET);
    await t.expect(cliPage.cliHelperOutputTitles.count).gt(0, 'List of commands were not found');
    // Unselect previous command from list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SET);
    await t.expect(cliPage.cliHelperOutputTitles.count).eql(0, 'List of commands were not cleared');
    await t.expect(cliPage.cliHelperText.textContent).eql(defaultHelperText, 'Default text for CLI Helper is not shown');

    // Verify that user can see relevant search results in Command Helper per every entered symbol
    await t.click(cliPage.cliHelperSearch);
    await t.typeText(cliPage.cliHelperSearch, 's');
    // Verify that we found commands
    await t.expect(cliPage.cliHelperOutputTitles.count).gt(0, 'List of commands were not found');
    const countCommandsOfOneLetterSearch = await cliPage.cliHelperOutputTitles.count;
    // Continue typing
    await t.typeText(cliPage.cliHelperSearch, 'a');
    const countCommandsOfTwoLettersSearch = await cliPage.cliHelperOutputTitles.count;
    // Verify that first list has more count than the second
    await t.expect(countCommandsOfOneLetterSearch).gt(countCommandsOfTwoLettersSearch, 'Count of commands with 1 letter not more than 2');

    // Verify that when user has used search and apply filters, search results include only commands from the filter group applied
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SET);
    await t.expect(cliPage.cliHelperOutputTitles.withText('SAVE').exists).notOk('Commands found from another group');
    await t.expect(cliPage.cliHelperOutputTitles.withText('SADD').exists).ok('Proper command was not found');

    // Verify that Command helper cleared when user runs the command in CLI
    await t.click(cliPage.cliExpandButton);
    // Enter command into CLI
    await t.typeText(cliPage.cliCommandInput, COMMAND_APPEND, { speed: 0.5, replace: true, paste: true });
    await t.expect(cliPage.filterGroupTypeButton.textContent).notContains(COMMAND_GROUP_SET, 'Filter was not cleared');
    await t.expect(cliPage.cliHelperSearch.value).eql('', 'Search was not cleared');

    // Verify that when user enters command in CLI, Helper displays additional info about the command
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('APPEND key value', 'Command name and syntax not displayed');
    await t.expect(cliPage.cliHelperTitle.innerText).contains('STRING', 'Command Group badge not displayed');
    await t.expect(cliPage.cliHelperSummary.innerText).contains(`Appends a string to the value of a key. Creates the key if it doesn't exist.`, 'Command summary not displayed');
});
test
    .meta({ env: env.web })('Verify that user can type TS. in Command helper and see commands from RedisTimeSeries commands.json', async t => {
        const commandForSearch = 'TS.';
        // Open Command Helper
        await t.click(cliPage.expandCommandHelperButton);
        // Select group from list and remember commands
        await cliPage.selectFilterGroupType(COMMAND_GROUP_TIMESERIES);
        const commandsFilterCount = await cliPage.cliHelperOutputTitles.count;
        const timeSeriesCommands: string[] = [];
        for(let i = 0; i < commandsFilterCount; i++) {
            timeSeriesCommands.push(await cliPage.cliHelperOutputTitles.nth(i).textContent);
        }
        // Unselect group from list
        await cliPage.selectFilterGroupType(COMMAND_GROUP_TIMESERIES);
        // Search per part of command and check all opened commands
        await cliActions.checkSearchedCommandInCommandHelper(commandForSearch, timeSeriesCommands);
        // Check the first command documentation url
        await cliPage.checkURLCommand(timeSeriesCommands[0], `https://redis.io/commands/${timeSeriesCommands[0].toLowerCase()}/`);
        await t.switchToParentWindow();
    });
test
    .meta({ env: env.web })('Verify that user can type GRAPH. in Command helper and see auto-suggestions from RedisGraph commands.json', async t => {
        const commandForSearch = 'GRAPH.';
        const externalPageLink = 'https://redis.io/commands/graph.config-get/';
        // Open Command Helper
        await t.click(cliPage.expandCommandHelperButton);
        // Select group from list and remember commands
        await cliPage.selectFilterGroupType(COMMAND_GROUP_GRAPH);
        const commandsFilterCount = await cliPage.cliHelperOutputTitles.count;
        const graphCommands: string[] = [];
        for(let i = 0; i < commandsFilterCount; i++) {
            graphCommands.push(await cliPage.cliHelperOutputTitles.nth(i).textContent);
        }
        // Unselect group from list
        await cliPage.selectFilterGroupType(COMMAND_GROUP_GRAPH);
        // Search per part of command and check all opened commands
        await cliActions.checkSearchedCommandInCommandHelper(commandForSearch, graphCommands);
        // Check the first command documentation url
        await cliPage.checkURLCommand(graphCommands[0], externalPageLink);
        await t.switchToParentWindow();
    });
