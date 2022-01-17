import { Selector } from 'testcafe';
import { acceptLicenseTermsAndAddDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();

const indexName =  'products';

fixture `Scripting area at Workbench`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async(t) => {
        //Clear database
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
    });
test('Verify that user can run multiple commands written in multiple lines in Workbench page', async t => {
    const commandsForSend = [
        'info',
        `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA name TEXT`,
        'HMSET product:1 price 20',
        'FT._LIST'
    ]
    //Send commands in multiple lines
    await workbenchPage.sendCommandInWorkbench(commandsForSend.join('\n'), 0.5);
    //Check the result
    for(let i = 1; i < commandsForSend.length + 1; i++) {
        const resultCommand = await workbenchPage.queryCardCommand.nth(i - 1).textContent;
        await t.expect(resultCommand).eql(commandsForSend[commandsForSend.length - i], `The command ${commandsForSend[commandsForSend.length - i]} is in the result`);
    }
});
test('Verify that user can use double slashes (//) wrapped in double quotes and these slashes will not comment out any characters', async t => {
    const commandsForSend = [
        'HMSET product:1 price 20',
        'FT._LIST'
    ];
    //Send commands in multiple lines with double slashes (//) wrapped in double quotes
    await workbenchPage.sendCommandInWorkbench(commandsForSend.join('\n"//"'), 0.5);
    //Check that all commands are executed
    for(let i = 1; i < commandsForSend.length + 1; i++) {
        const resultCommand = await workbenchPage.queryCardCommand.nth(i - 1).textContent;
        await t.expect(resultCommand).contains(commandsForSend[commandsForSend.length - i], `The command ${commandsForSend[commandsForSend.length - i]} is in the result`);
    }
});
test('Verify that user can see an indication (green triangle) of commands from the left side of the line numbers', async t => {
    //Open Working with Hashes page
    await t.click(workbenchPage.internalLinkWorkingWithHashes);
    //Put Create Hash commands into Editing area
    await t.click(workbenchPage.preselectHashCreate);
    //Maximize Scripting area to see all the commands
    await t.drag(workbenchPage.resizeButtonForScriptingAndResults, 0, 300, { speed: 0.4 });
    //Get number of commands in scripting area
    const numberOfCommands = await Selector('span').withExactText('HSET').count;
    //Compare number of indicator displayed and expected value
    await t.expect(workbenchPage.monacoCommandIndicator.count).eql(numberOfCommands, 'Number of command indicator');
});
test('Verify that user can find (using right click) "Run Commands" custom shortcut option in monaco menu and run a command', async t => {
    const command = 'HSET key field value';
    //Put a command in Editing Area
    await t.typeText(workbenchPage.queryInput, command);
    //Right click to get context menu
    await t.rightClick(workbenchPage.queryInput);
    //Select Command Palette option
    await t.click(workbenchPage.monacoContextMenu.find(workbenchPage.cssMonacoCommandPaletteLine));
    //Print "Run Commands" shortcut
    await t.typeText(workbenchPage.monacoShortcutInput, 'Run Commands');
    //Select "Run Commands" from menu
    await t.click(workbenchPage.monacoSuggestionOption);
    //Check the result with sent command
    const commandTextInResult = await workbenchPage.queryCardCommand.withExactText(command);
    await t.expect(commandTextInResult.exists).ok('The result of sent command');
});
test('Verify that user can repeat commands by entering a number of repeats before the Redis command and see separate results per each command in Workbench', async t => {
    const command = 'FT._LIST';
    const repeats = 5;
    //Rum command in Workbench with repeats
    await workbenchPage.sendCommandInWorkbench(`${repeats} ${command}`);
    //Verify result
    for (let i = 0; i < repeats; i++) {
        await t.expect(workbenchPage.queryCardContainer.nth(i).textContent).contains(command, `Workbench contains separate results`);
    }
});
