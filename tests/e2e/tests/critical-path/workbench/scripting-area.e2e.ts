import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();
const chance = new Chance();

let indexName = chance.word({ length: 5 });
let keyName = chance.word({ length: 5 });

fixture `Scripting area at Workbench`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async t => {
        await t.switchToMainWindow();
        //Drop index, documents and database
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can run any script from CLI in Workbench and see the results', async t => {
        const commandForSend = 'info';
        //Send command
        await workbenchPage.sendCommandInWorkbench(commandForSend);
        // Check if results exist
        await t.expect(await workbenchPage.queryCardContainer.exists).ok('Query card was added');
        const sentCommandText = await workbenchPage.queryCardCommand.withExactText(commandForSend);
        await t.expect(sentCommandText.exists).ok('Result of sent command exists');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can resize scripting area in Workbench', async t => {
        const offsetY = 200;
        const inputHeightStart = await workbenchPage.queryInput.clientHeight;
        await t.drag(workbenchPage.resizeButtonForScriptingAndResults, 0, offsetY, { speed: 0.4 });
        await t.expect(await workbenchPage.queryInput.clientHeight).eql(inputHeightStart + offsetY, 'Scripting area after resize has proper size');
    });
//skipped due the inaccessibility of the iframe
test.skip
    .meta({ env: 'web', rte: rte.standalone })
    ('Verify that user when he have more than 10 results can request to view more results in Workbench', async t => {
        indexName = chance.word({ length: 5 });
        keyName = chance.word({ length: 5 });
        const commandsForSendInCli = [
            `HMSET product:1 name "${keyName}"`,
            `HMSET product:2 name "${keyName}"`,
            `HMSET product:3 name "${keyName}"`,
            `HMSET product:4 name "${keyName}"`,
            `HMSET product:5 name "${keyName}"`,
            `HMSET product:6 name "${keyName}"`,
            `HMSET product:7 name "${keyName}"`,
            `HMSET product:8 name "${keyName}"`,
            `HMSET product:9 name "${keyName}"`,
            `HMSET product:10 name "${keyName}"`,
            `HMSET product:11 name "${keyName}"`,
            `HMSET product:12 name "${keyName}"`,
        ];
        const commandToCreateSchema = `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA name TEXT`;
        const searchCommand = `FT.SEARCH ${indexName} * LIMIT 0 20`;
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
        await t.switchToIframe(workbenchPage.iframe);
        await t.expect(containerOfCommand.find(workbenchPage.cssSelectorPaginationButtonPrevious).exists)
            .ok('Pagination previous button exists');
        await t.expect(containerOfCommand.find(workbenchPage.cssSelectorPaginationButtonNext).exists)
            .ok('Pagination next button exists'); 
    });
//skipped due the inaccessibility of the iframe
test.skip
    .meta({ env: 'web', rte: rte.standalone })
    ('Verify that user can see result in Table and Text views for Hash data types for FT.SEARCH command in Workbench', async t => {
        indexName = chance.word({ length: 5 });
        keyName = chance.word({ length: 5 });
        const commandsForSend = [
            `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA name TEXT`,
            `HMSET product:1 name "${keyName}"`,
            `HMSET product:2 name "${keyName}"`
        ];
        const searchCommand = `FT.SEARCH ${indexName} * LIMIT 0 20`;
        //Send commands
        await workbenchPage.sendCommandInWorkbench(commandsForSend.join('\n'));
        //Send search command
        await workbenchPage.sendCommandInWorkbench(searchCommand);
        //Check that result is displayed in Table view
        await t.switchToIframe(workbenchPage.iframe);
        await t.expect(workbenchPage.queryTableResult.exists).ok('The result is displayed in Table view');
        //Select Text view type
        await t.switchToMainWindow();
        await workbenchPage.selectViewTypeText();
        //Check that result is displayed in Text view
        await t.expect(workbenchPage.queryTextResult.exists).ok('The result is displayed in Text view');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can run one command in multiple lines in Workbench page', async t => {
        indexName = chance.word({ length: 5 });
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
    .meta({ rte: rte.standalone })
    ('Verify that user can use one indent to indicate command in several lines in Workbench page', async t => {
        indexName = chance.word({ length: 5 });
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
