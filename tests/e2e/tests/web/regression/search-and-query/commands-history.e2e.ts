import { KeysInteractionTabs, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage, WorkbenchPage } from '../../../../pageObjects';
import { SearchAndQueryPage } from '../../../../pageObjects/search-and-query-page';
import { commonUrl, ossClusterConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const searchAndQueryPage = new SearchAndQueryPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const browserPage = new BrowserPage();
const workbenchPage = new WorkbenchPage();

const commandForSend1 = 'FT.INFO';
const commandForSend2 = 'FT._LIST';
let indexName = Common.generateWord(5);

const commandsForIndex = [
    `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA price NUMERIC SORTABLE`,
    'HMSET product:1 price 20',
    'HMSET product:2 price 100'
];

fixture `Command results at Search and Query`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
        await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);
    })
    .afterEach(async t => {
        await t.switchToMainWindow();
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
        await databaseAPIRequests.deleteOSSClusterDatabaseApi(ossClusterConfig);
    });
test('Verify that user can see re-run icon near the already executed command and re-execute the command by clicking on the icon in Workbench page', async t => {
    // Send commands
    await searchAndQueryPage.sendCommandInWorkbench(commandForSend1);
    await searchAndQueryPage.sendCommandInWorkbench(commandForSend2);
    const containerOfCommand = await searchAndQueryPage.getCardContainerByCommand(commandForSend1);
    const containerOfCommand2 = await searchAndQueryPage.getCardContainerByCommand(commandForSend2);
    // Verify that re-run icon is displayed
    await t.expect(await searchAndQueryPage.reRunCommandButton.visible).ok('Re-run icon is not displayed');
    // Re-run the last command in results
    await t.click(containerOfCommand.find(searchAndQueryPage.cssReRunCommandButton));
    // Verify that command is re-executed
    await t.expect(searchAndQueryPage.queryCardCommand.textContent).eql(commandForSend1, 'The command is not re-executed');

    // Verify that user can see expanded result after command re-run at the top of results table in Workbench
    await t.expect(await searchAndQueryPage.queryCardContainer.nth(0).find(searchAndQueryPage.cssQueryTextResult).visible)
        .ok('Re-executed command is not expanded');
    await t.expect(searchAndQueryPage.queryCardCommand.nth(0).textContent).eql(commandForSend1, 'The re-executed command is not at the top of results table');

    // Delete the command from results
    await t.click(containerOfCommand2.find(searchAndQueryPage.cssDeleteCommandButton));
    // Verify that user can delete command with result from table with results in Workbench
    await t.expect(searchAndQueryPage.queryCardCommand.withExactText(commandForSend2).exists).notOk(`Command ${commandForSend2} is not deleted from table with results`);
});
test('Verify that user can see the results found in the table view by default for FT.INFO, FT.SEARCH and FT.AGGREGATE', async t => {
    const commands = [
        'FT.INFO',
        'FT.SEARCH',
        'FT.AGGREGATE'
    ];
    // Send commands and check table view is default
    for(const command of commands) {
        await searchAndQueryPage.sendCommandInWorkbench(command);
        await t.expect(searchAndQueryPage.queryCardContainer.nth(0).find(searchAndQueryPage.cssTableViewTypeOption).exists).ok(`The table view is not selected by default for command ${command}`);
    }
});
test
    .after(async() => {
        await searchAndQueryPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
    })('Verify that user can switches between views and see results according to the view rules in Workbench in results', async t => {
        indexName = Common.generateWord(5);
        const commands = [
            'hset doc:10 title "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud" url "redis.io" author "Test" rate "undefined" review "0" comment "Test comment"',
            `FT.CREATE ${indexName} ON HASH PREFIX 1 doc: SCHEMA title TEXT WEIGHT 5.0 body TEXT url TEXT author TEXT rate TEXT review TEXT comment TEXT`,
            `FT.SEARCH ${indexName} * limit 0 10000`
        ];
        // Send commands and check table view is default for Search command
        for (const command of commands) {
            await searchAndQueryPage.sendCommandInWorkbench(command);
        }
        await t.expect(await searchAndQueryPage.queryCardContainer.nth(0).find(searchAndQueryPage.cssTableViewTypeOption).exists)
            .ok('The table view is not selected by default for command FT.SEARCH');
        await t.switchToIframe(searchAndQueryPage.iframe);
        await t.expect(await searchAndQueryPage.queryTableResult.visible).ok('The table result is not displayed for command FT.SEARCH');
        // Select Text view and check result
        await t.switchToMainWindow();
        await searchAndQueryPage.selectViewTypeText();
        await t.expect(await searchAndQueryPage.queryCardContainer.nth(0).find(searchAndQueryPage.cssQueryTextResult).visible).ok('The result is not displayed in Text view');
    });

test('Verify that user can clear all results at once.', async t => {
    await t.click(searchAndQueryPage.clearResultsBtn);
    await t.expect(searchAndQueryPage.queryTextResult.exists).notOk('Clear all button does not remove commands');
});

test('Verify that user can switches between Table and Text for FT.AGGREGATE and see results corresponding to their views', async t => {

    await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.Workbench);
    await workbenchPage.sendCommandsArrayInWorkbench(commandsForIndex);
    await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);
    const aggregateCommand = `FT.Aggregate ${indexName} * GROUPBY 0 REDUCE MAX 1 @price AS max_price`;

    // Send FT.AGGREGATE and switch to Text view
    await searchAndQueryPage.sendCommandInWorkbench(aggregateCommand);
    await searchAndQueryPage.selectViewTypeText();
    await t.expect(searchAndQueryPage.queryCardContainer.nth(0).find(searchAndQueryPage.cssQueryTextResult).visible).ok('The text view is not switched for command FT.AGGREGATE');
    // Switch to Table view and check result
    await searchAndQueryPage.selectViewTypeTable();
    await t.switchToIframe(searchAndQueryPage.iframe);
    await t.expect(searchAndQueryPage.queryTableResult.exists).ok('The table view is not switched for command FT.AGGREGATE');
});

test('Verify that user can switches between Table and Text for FT.SEARCH and see results corresponding to their views', async t => {
    await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.Workbench);
    await workbenchPage.sendCommandsArrayInWorkbench(commandsForIndex);
    await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);
    const searchCommand = `FT.SEARCH ${indexName} *`;

    // Send FT.SEARCH and switch to Text view
    await searchAndQueryPage.sendCommandInWorkbench(searchCommand);
    await searchAndQueryPage.selectViewTypeText();
    await t.expect(searchAndQueryPage.queryCardContainer.nth(0).find(searchAndQueryPage.cssQueryTextResult).visible).ok('The text view is not switched for command FT.SEARCH');
    // Switch to Table view and check result
    await searchAndQueryPage.selectViewTypeTable();
    await t.switchToIframe(searchAndQueryPage.iframe);
    await t.expect(searchAndQueryPage.queryTableResult.exists).ok('The table view is not switched for command FT.SEARCH');
});
test('Verify that user can switches between Table and Text for FT.INFO and see results corresponding to their views', async t => {
    await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.Workbench);
    await workbenchPage.sendCommandsArrayInWorkbench(commandsForIndex);
    await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);
    const infoCommand = `FT.INFO ${indexName}`;

    // Send FT.INFO and switch to Text view
    await searchAndQueryPage.sendCommandInWorkbench(infoCommand);
    await searchAndQueryPage.selectViewTypeText();
    await t.expect(searchAndQueryPage.queryCardContainer.nth(0).find(searchAndQueryPage.cssQueryTextResult).exists).ok('The text view is not switched for command FT.INFO');
    // Switch to Table view and check result
    await searchAndQueryPage.selectViewTypeTable();
    await t.switchToIframe(searchAndQueryPage.iframe);
    await t.expect(searchAndQueryPage.queryTableResult.exists).ok('The table view is not switched for command FT.INFO');
});
test('Verify that user can see original date and time of command execution in Workbench history after the page update', async t => {
    const keyName = Common.generateWord(5);
    const command = `set ${keyName} test`;

    // Send command and remember the time
    await searchAndQueryPage.sendCommandInWorkbench(command);
    const dateTime = await searchAndQueryPage.queryCardContainer.nth(0).find(searchAndQueryPage.cssCommandExecutionDateTime).textContent;
    // Wait fo 1 minute, refresh page and check results
    await t.wait(60000);
    await searchAndQueryPage.reloadPage();
    await t.expect(searchAndQueryPage.queryCardContainer.nth(0).find(searchAndQueryPage.cssCommandExecutionDateTime).textContent).eql(dateTime, 'The original date and time of command execution is not saved after the page update');
});

