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

const indexName = 'products';

fixture `Scripting area at Workbench`
    .meta({type: 'critical_path'})
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
test('Verify that user can run any script from CLI in Workbench and see the results', async t => {
    const commandForSend = 'info';
    //Send command
    await workbenchPage.sendCommandInWorkbench(commandForSend);
    // Check if results exist
    await t.expect(await workbenchPage.queryCardContainer.exists).ok('Query card was added');
    const sentCommandText = await workbenchPage.queryCardCommand.withExactText(commandForSend);
    await t.expect(sentCommandText.exists).ok('Result of sent command exists');
});
test('Verify that user can resize scripting area in Workbench', async t => {
    const offsetY = 200;
    const inputHeightStart = await workbenchPage.queryInput.clientHeight;
    await t.drag(workbenchPage.resizeButtonForScriptingAndResults, 0, offsetY, { speed: 0.4 });
    await t.expect(await workbenchPage.queryInput.clientHeight).eql(inputHeightStart + offsetY, 'Scripting area after resize has proper size');
});
//skipped due the inaccessibility of the iframe
test.skip('Verify that user when he have more than 10 results can request to view more results in Workbench', async t => {
    const commandsForSendInCli = [
        'HMSET product:1 name "Apple Juice"',
        'HMSET product:2 name "Apple Juice"',
        'HMSET product:3 name "Apple Juice"',
        'HMSET product:4 name "Apple Juice"',
        'HMSET product:5 name "Apple Juice"',
        'HMSET product:6 name "Apple Juice"',
        'HMSET product:7 name "Apple Juice"',
        'HMSET product:8 name "Apple Juice"',
        'HMSET product:9 name "Apple Juice"',
        'HMSET product:10 name "Apple Juice"',
        'HMSET product:11 name "Apple Juice"',
        'HMSET product:12 name "Apple Juice"'
    ];
    const commandToCreateSchema = 'FT.CREATE products ON HASH PREFIX 1 product: SCHEMA name TEXT';
    const searchCommand = 'FT.SEARCH products * LIMIT 0 20';
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Create new keys for search
    for(const command of commandsForSendInCli) {
        await t.typeText(cliPage.cliCommandInput, command, { replace: true });
        await t.pressKey('enter');
    }
    await t.click(cliPage.cliCollapseButton);
    //Send commands
    await workbenchPage.sendCommandInWorkbench(commandToCreateSchema);
    //Send search command
    await workbenchPage.sendCommandInWorkbench(searchCommand);
    //Get needed container
    const containerOfCommand = await workbenchPage.getCardContainerByCommand(searchCommand);
    //Verify that we have pagination buttons
    await t.expect(containerOfCommand.find(workbenchPage.cssSelectorPaginationButtonPrevious).exists)
        .ok('Pagination previous button exists');
    await t.expect(containerOfCommand.find(workbenchPage.cssSelectorPaginationButtonNext).exists)
        .ok('Pagination next button exists');
    //Drop index and documents
    await workbenchPage.sendCommandInWorkbench('FT.DROPINDEX products DD');
});
//skipped due the inaccessibility of the iframe
test.only.after(async t => {
        //Drop index and documents
        await workbenchPage.sendCommandInWorkbench('FT.DROPINDEX products DD');
    })
    ('Verify that user can see result in Table and Text views for Hash data types for FT.SEARCH command in Workbench', async t => {
        const commandsForSend = [
            'FT.CREATE products ON HASH PREFIX 1 product: SCHEMA name TEXT',
            'HMSET product:1 name "Apple Juice" ',
            'HMSET product:2 name "Apple Juice"'
        ];
        const searchCommand = 'FT.SEARCH products * LIMIT 0 20';
        //Send commands
        await workbenchPage.sendCommandInWorkbench(commandsForSend.join('\n'));
        //Send search command
        await workbenchPage.sendCommandInWorkbench(searchCommand);
        //Check that result is displayed in Table view
        t.wait(10000)
        t.debug()
        await t.expect(workbenchPage.queryTableResult.exists).ok('The result is displayed in Table view');
        //Select Text view type
        await workbenchPage.selectViewTypeText();
        //Check that result is displayed in Text view
        await t.expect(workbenchPage.queryTextResult.exists).ok('The result is displayed in Text view');
    });
test
    .after(async t => {
        //Drop index and documents
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
    })
    ('Verify that user can run one command in multiple lines in Workbench page', async t => {
        const multipleLinesCommand = [
            `FT.CREATE ${indexName}`,
            'ON HASH PREFIX 1 product:',
            'SCHEMA price NUMERIC SORTABLE'
        ];
        //Send command in multiple lines
        await workbenchPage.sendCommandInWorkbench(multipleLinesCommand.join('\n\t'), 0.5);
        //Check the result
        const resultCommand = await workbenchPage.queryCardCommand.nth(0).textContent;
        for(const commandPart of multipleLinesCommand) {
            await t.expect(resultCommand).contains(commandPart, 'The multiple lines command is in the result');
        }
    });
test
    .after(async t => {
        //Drop index and documents
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
    })
    ('Verify that user can use one indent to indicate command in several lines in Workbench page', async t => {
        const multipleLinesCommand = [
            `FT.CREATE ${indexName}`,
            'ON HASH PREFIX 1 product: SCHEMA price NUMERIC SORTABLE'
        ];
        //Send command in multiple lines
        await t.typeText(workbenchPage.queryInput, multipleLinesCommand[0]);
        await t.pressKey('enter tab');
        await t.typeText(workbenchPage.queryInput, multipleLinesCommand[1]);
        await t.click(workbenchPage.submitCommandButton);
        //Check the result
        const resultCommand = await workbenchPage.queryCardCommand.nth(0).textContent;
        for(const commandPart of multipleLinesCommand) {
            await t.expect(resultCommand).contains(commandPart, 'The multiple lines command is in the result');
        }
    });
