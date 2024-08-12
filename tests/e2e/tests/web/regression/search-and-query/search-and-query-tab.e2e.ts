import { Common, DatabaseHelper } from '../../../../helpers';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { BrowserPage } from '../../../../pageObjects';
import { ExploreTabs, KeysInteractionTabs, rte } from '../../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { SearchAndQueryPage } from '../../../../pageObjects/search-and-query-page';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const browserPage = new BrowserPage();
const searchAndQueryPage = new SearchAndQueryPage();
const apiKeyRequests = new APIKeyRequests();

const keyName = Common.generateWord(10);
let keyNames: string[];
let indexName1: string;
let indexName2: string;

fixture `Autocomplete for entered commands in search and query`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        indexName1 = `idx1:${keyName}`;
        indexName2 = `idx2:${keyName}`;
        keyNames = [`${keyName}:1`, `${keyName}:2`, `${keyName}:3`];
        const commands = [
            `HSET ${keyNames[0]} "name" "Hall School" "description" " Spanning 10 states" "class" "independent" "type" "traditional" "address_city" "London" "address_street" "Manor Street" "students" 342 "location" "51.445417, -0.258352"`,
            `HSET ${keyNames[1]} "name" "Garden School" "description" "Garden School is a new outdoor" "class" "state" "type" "forest; montessori;" "address_city" "London" "address_street" "Gordon Street" "students" 1452 "location" "51.402926, -0.321523"`,
            `HSET ${keyNames[2]} "name" "Gillford School" "description" "Gillford School is a centre" "class" "private" "type" "democratic; waldorf" "address_city" "Goudhurst" "address_street" "Goudhurst" "students" 721 "location" "51.112685, 0.451076"`,
            `FT.CREATE ${indexName1} ON HASH PREFIX 1 "${keyName}:" SCHEMA name TEXT NOSTEM description TEXT class TAG type TAG SEPARATOR ";" address_city AS city TAG address_street AS address TEXT NOSTEM students NUMERIC SORTABLE location GEO`,
            `FT.CREATE ${indexName2} ON HASH PREFIX 1 "${keyName}:" SCHEMA name TEXT NOSTEM description TEXT class TAG type TAG SEPARATOR ";" address_city AS city TAG address_street AS address TEXT NOSTEM students NUMERIC SORTABLE location GEO`
        ];

        // Create 3 keys and index
        await browserPage.Cli.sendCommandsInCli(commands);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await browserPage.Cli.sendCommandsInCli([`DEL ${keyNames.join(' ')}`, `FT.DROPINDEX ${indexName1}`]);
        await browserPage.Cli.sendCommandsInCli([`DEL ${keyNames.join(' ')}`, `FT.DROPINDEX ${indexName2}`]);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that tutorials can be opened from Workbench', async t => {
    const search = await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);
    await t.click(search.getTutorialLinkLocator('sq-exact-match'));
    await t.expect(search.InsightsPanel.sidePanel.exists).ok('Insight panel is not opened');
    const tab = await browserPage.InsightsPanel.setActiveTab(ExploreTabs.Tutorials);
    await t.expect(tab.preselectArea.textContent).contains('EXACT MATCH', 'the tutorial page is incorrect');
});
test('Verify that user can use show more to see command fully in 2nd tooltip', async t => {
    const commandDetails = [
        'index query [VERBATIM] [LOAD count field [field ...]]',
        'Run a search query on an index and perform aggregate transformations on the results',
        'Arguments:',
        'required index',
        'required query',
        'optional [verbatim]'
    ];
    await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);
    await t.typeText(searchAndQueryPage.queryInput, 'FT', { replace: true });
    // Verify that user can use show more to see command fully in 2nd tooltip
    await t.pressKey('ctrl+space');
    await t.expect(searchAndQueryPage.MonacoEditor.monacoCommandDetails.exists).ok('The "read more" about the command is not opened');
    for(const detail of commandDetails) {
        await t.expect(searchAndQueryPage.MonacoEditor.monacoCommandDetails.textContent).contains(detail, `The ${detail} command detail is not displayed`);
    }
    // Verify that user can close show more tooltip by 'x' or 'Show less'
    await t.pressKey('ctrl+space');
    await t.expect(searchAndQueryPage.MonacoEditor.monacoCommandDetails.exists).notOk('The "read more" about the command is not closed');
});
test('Verify full commands suggestions with index and query for FT.AGGREGATE', async t => {
    const groupByArgInfo = 'GROUPBY nargs property [property ...] [REDUCE function nargs arg [arg ...] [AS name] [REDUCE function nargs arg [arg ...] [AS name] ...]]';
    const indexFields = [
        'address',
        'city',
        'class',
        'description',
        'location',
        'name',
        'students',
        'type'
    ];
    await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);

    // Verify basic commands suggestions FT.SEARCH and FT.AGGREGATE
    await t.typeText(searchAndQueryPage.queryInput, 'FT', { replace: true });
    // Verify that the list with FT.SEARCH and FT.AGGREGATE auto-suggestions is displayed
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.count).eql(2, 'FT.SEARCH and FT.AGGREGATE auto-suggestions are not displayed');
    // Select command and check result
    await t.pressKey('enter');
    let script = await searchAndQueryPage.queryInputScriptArea.textContent;
    await t.expect(script.replace(/\s/g, ' ')).contains('FT.AGGREGATE ', 'Result of sent command exists');

    // Verify that user can see the list of all the indexes in database when put a space after only FT.SEARCH and FT.AGGREGATE commands
    await t.expect(script.replace(/\s/g, ' ')).contains(`"${indexName1}" "" `, 'Index not suggested into input');
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.withExactText(indexName1).exists).ok('Index not auto-suggested');
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.withExactText(indexName2).exists).ok('All indexes not auto-suggested');

    await t.pressKey('tab');
    await t.typeText(searchAndQueryPage.queryInput, '@', { replace: false });
    script = await searchAndQueryPage.queryInputScriptArea.textContent;
    // Verify that user can see the list of fields from the index selected when type in “@”
    await t.expect(script.replace(/\s/g, ' ')).contains('address', 'Index not suggested into input');
    for(const field of indexFields) {
        await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.withExactText(field).exists).ok(`${field} Index field not auto-suggested`);
    }
    // Verify that user can use autosuggestions by typing fields from index after "@"
    await t.typeText(searchAndQueryPage.queryInput, 'c', { replace: false });
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.withExactText('city').exists).ok('Index field not auto-suggested after starting typing');
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.count).eql(1, 'Wrong index fields suggested after typing first letter');

    // Verify contextual suggestions after typing letters for commands
    await t.pressKey('tab');
    await t.pressKey('right');
    await t.pressKey('space');
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.withExactText('APPLY').exists).ok('FT.AGGREGATE arguments not suggested');
    await t.typeText(searchAndQueryPage.queryInput, 'g', { replace: false });
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.nth(0).textContent).contains('GROUPBY', 'Argument not suggested after typing first letters');

    await t.pressKey('tab');
    // Verify that user can see widget about entered argument
    await t.expect(searchAndQueryPage.MonacoEditor.monacoHintWithArguments.withText(groupByArgInfo).exists).ok('Widget with info about entered argument not displayed');

    await t.typeText(searchAndQueryPage.queryInput, '1 "London"', { replace: false });
    await t.pressKey('space');
    // Verify correct order of suggested arguments like LOAD, GROUPBY, SORTBY
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.nth(0).textContent).contains('REDUCE', 'Incorrect order of suggested arguments');
    await t.pressKey('tab');
    await t.typeText(searchAndQueryPage.queryInput, 'SUM 1 @students', { replace: false });
    await t.pressKey('space');

    // Verify expression and function suggestions like AS for APPLY/GROUPBY
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.nth(0).textContent).contains('AS', 'Incorrect order of suggested arguments');
    await t.pressKey('tab');
    await t.typeText(searchAndQueryPage.queryInput, 'stud', { replace: false });

    await t.pressKey('space');
    // Verify multiple argument option suggestions
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.nth(0).textContent).contains('REDUCE', 'Incorrect order of suggested arguments');
    // Verify complex command sequences like nargs and properties are suggested accurately for GROUPBY
    const expectedText = `FT.AGGREGATE "${indexName1}" "@city" GROUPBY 1 "London" REDUCE SUM 1 @students AS stud REDUCE`.trim().replace(/\s+/g, ' ');
    await t.expect((await searchAndQueryPage.queryInputForText.innerText).trim().replace(/\s+/g, ' ')).contains(expectedText, 'Incorrect order of entered arguments');
});
test('Verify full commands suggestions with index and query for FT.SEARCH', async t => {
    await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);
    await t.typeText(searchAndQueryPage.queryInput, 'FT', { replace: true });
    // Select command and check result
    await t.pressKey('down');
    await t.pressKey('enter');
    const script = await searchAndQueryPage.queryInputScriptArea.textContent;
    await t.expect(script.replace(/\s/g, ' ')).contains('FT.SEARCH ', 'Result of sent command exists');

    await t.pressKey('tab');
    await t.typeText(searchAndQueryPage.queryInput, '@c', { replace: false });
    // Select '@city' field
    await t.pressKey('down');
    await t.pressKey('tab');
    await t.pressKey('right');
    await t.pressKey('space');
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.withExactText('DIALECT').exists).ok('FT.SEARCH arguments not suggested');
    await t.typeText(searchAndQueryPage.queryInput, 'n', { replace: false });
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.nth(0).textContent).contains('NOCONTENT', 'Argument not suggested after typing first letters');
    await t.pressKey('tab');
    // Verify that FT.SEARCH and FT.AGGREGATE non-multiple arguments are suggested only once
    await t.pressKey('space');
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.withText('NOCONTENT').exists).notOk('Non-multiple arguments are suggested not only once');

    // Verify that suggestions correct to closest valid commands or options for invalid typing like WRONGCOMMAND
    await t.typeText(searchAndQueryPage.queryInput, 'WRONGCOMMAND', { replace: false });
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestion.withExactText('WITHSORTKEYS').exists).ok('Closest suggestions not displayed');

    await t.pressKey('space');
    await t.pressKey('backspace');
    await t.pressKey('backspace');
    // Verify that 'No suggestions' tooltip is displayed when returning to invalid typing like WRONGCOMMAND
    await t.expect(searchAndQueryPage.MonacoEditor.monacoSuggestWidget.textContent).contains('No suggestions.', 'Index not auto-suggested');
});
