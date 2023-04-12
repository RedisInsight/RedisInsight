import { Selector } from 'testcafe';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage, SettingsPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const settingsPage = new SettingsPage();
const common = new Common();

const indexName = common.generateWord(5);
let keyName = common.generateWord(5);

fixture `Scripting area at Workbench`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    })
    .afterEach(async() => {
        // Clear and delete database
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can run multiple commands written in multiple lines in Workbench page', async t => {
    const commandsForSend = [
        'info',
        `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA name TEXT`,
        'HMSET product:1 price 20',
        'FT._LIST'
    ];

    // Go to Settings page
    await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
    // Specify Commands in pipeline
    await t.click(settingsPage.accordionWorkbenchSettings);
    await settingsPage.changeCommandsInPipeline('1');
    // Go to Workbench page
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    // Send commands in multiple lines
    await workbenchPage.sendCommandInWorkbench(commandsForSend.join('\n'), 0.5);
    // Check the result
    for (let i = 1; i < commandsForSend.length + 1; i++) {
        const resultCommand = workbenchPage.queryCardCommand.nth(i - 1).textContent;
        await t.expect(resultCommand).eql(commandsForSend[commandsForSend.length - i], `The command ${commandsForSend[commandsForSend.length - i]} is in not the result`);
    }
});
test
    .after(async() => {
        // Clear and delete database
        await workbenchPage.Cli.sendCommandInCli(`DEL ${keyName}`);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can use double slashes (//) wrapped in double quotes and these slashes will not comment out any characters', async t => {
        keyName = common.generateWord(10);
        const commandsForSend = [
            `HMSET ${keyName} price 20`,
            'FT._LIST'
        ];

        // Go to Settings page
        await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
        // Specify Commands in pipeline
        await t.click(settingsPage.accordionWorkbenchSettings);
        await settingsPage.changeCommandsInPipeline('1');
        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
        // Send commands in multiple lines with double slashes (//) wrapped in double quotes
        await workbenchPage.sendCommandInWorkbench(commandsForSend.join('\n"//"'), 0.5);
        // Check that all commands are executed
        for (let i = 1; i < commandsForSend.length + 1; i++) {
            const resultCommand = workbenchPage.queryCardCommand.nth(i - 1).textContent;
            await t.expect(resultCommand).contains(commandsForSend[commandsForSend.length - i], `The command ${commandsForSend[commandsForSend.length - i]} is not in the result`);
        }
    });
test
    .after(async() => {
        // Clear and delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can see an indication (green triangle) of commands from the left side of the line numbers', async t => {
        // Open Working with Hashes page
        await t.click(workbenchPage.documentButtonInQuickGuides);
        await t.expect(workbenchPage.internalLinkWorkingWithHashes.visible).ok('The working with hachs link is not visible', { timeout: 5000 });
        await t.click(workbenchPage.internalLinkWorkingWithHashes);
        // Put Create Hash commands into Editing area
        await t.click(workbenchPage.preselectHashCreate);
        // Maximize Scripting area to see all the commands
        await t.drag(workbenchPage.resizeButtonForScriptingAndResults, 0, 300, { speed: 0.4 });
        //Get number of commands in scripting area
        const numberOfCommands = Selector('span').withExactText('HSET').count;
        //Compare number of indicator displayed and expected value
        await t.expect(workbenchPage.monacoCommandIndicator.count).eql(await numberOfCommands, 'Number of command indicator is incorrect');
    });
test
    .after(async() => {
        // Clear and delete database
        await workbenchPage.Cli.sendCommandInCli(`DEL ${keyName}`);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can find (using right click) "Run Commands" custom shortcut option in monaco menu and run a command', async t => {
        keyName = common.generateWord(10);
        const command = `HSET ${keyName} field value`;

        // Put a command in Editing Area
        await t.typeText(workbenchPage.queryInput, command);
        // Right click to get context menu
        await t.rightClick(workbenchPage.queryInput);
        // Select Command Palette option
        await t.click(workbenchPage.monacoContextMenu.find(workbenchPage.cssMonacoCommandPaletteLine));
        // Print "Run Commands" shortcut
        await t.typeText(workbenchPage.monacoShortcutInput, 'Run Commands');
        // Select "Run Commands" from menu
        await t.click(workbenchPage.monacoSuggestionOption);
        // Check the result with sent command
        await t.expect(workbenchPage.queryCardCommand.withExactText(command).exists).ok('The result of sent command is not displayed');
    });
test('Verify that user can repeat commands by entering a number of repeats before the Redis command and see separate results per each command in Workbench', async t => {
    const command = 'FT._LIST';
    const command2 = 'select 13';
    const repeats = 5;
    const result = '"select is not supported by the Workbench.';

    // Run command in Workbench with repeats
    await workbenchPage.sendCommandInWorkbench(`${repeats} ${command}`);
    // Verify result
    for (let i = 0; i < repeats; i++) {
        await t.expect(workbenchPage.queryCardContainer.nth(i).textContent).contains(command, 'Workbench not contains separate results');
    }

    // Run Select command in Workbench
    await workbenchPage.sendCommandInWorkbench(command2);
    // Verify that user can not run "Select" command in Workbench
    await t.expect(workbenchPage.commandExecutionResultFailed.textContent).contains(result, 'The select command unsupported message is incorrect');

    // Type command and use Ctrl + Enter
    await t.typeText(workbenchPage.queryInput, command, { replace: true, paste: true });
    await t.pressKey('ctrl+enter');
    // Verify that user can use Ctrl + Enter to run the query in Workbench
    await t.expect(workbenchPage.queryCardCommand.withExactText(command).exists).ok('The user can not use Ctrl + Enter to run the query');
});
