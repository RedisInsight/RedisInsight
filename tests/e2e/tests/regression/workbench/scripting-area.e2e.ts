import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    WorkbenchPage,
    CliPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();

const indexName =  'products';

fixture `Scripting area at Workbench`
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
