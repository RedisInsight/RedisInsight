import { Chance } from 'chance';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { WorkbenchPage } from '../../../pageObjects/workbench-page';
import { MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const chance = new Chance();

const indexName = chance.word({ length: 5 });
const commandsForIndex = [
    `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA price NUMERIC SORTABLE`,
    'HMSET product:1 price 20',
    'HMSET product:2 price 100'
];

fixture `Command results at Workbench`
    .meta({type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        //Add index and data
        await t.click(myRedisDatabasePage.workbenchButton);
        await workbenchPage.sendCommandsArrayInWorkbench(commandsForIndex);
    })
    .afterEach(async t => {
        //Drop index and database
        await t.switchToMainWindow();
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .meta({ env: env.web })('Verify that user can switches between Table and Text for FT.INFO and see results corresponding to their views', async t => {
        // indexName = chance.word({ length: 5 });
        const infoCommand = `FT.INFO ${indexName}`;
        //Send FT.INFO and switch to Text view
        await workbenchPage.sendCommandInWorkbench(infoCommand);
        await workbenchPage.selectViewTypeText();
        await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).exists).ok('The text view is not switched for command FT.INFO');
        //Switch to Table view and check result
        await workbenchPage.selectViewTypeTable();
        await t.switchToIframe(workbenchPage.iframe);
        await t.expect(await workbenchPage.queryTableResult.exists).ok('The table view is not switched for command FT.INFO');
    });
test
    .meta({ env: env.web })('Verify that user can switches between Table and Text for FT.SEARCH and see results corresponding to their views', async t => {
        const searchCommand = `FT.SEARCH ${indexName} *`;
        //Send FT.SEARCH and switch to Text view
        await workbenchPage.sendCommandInWorkbench(searchCommand);
        await workbenchPage.selectViewTypeText();
        await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).visible).ok('The text view is not switched for command FT.SEARCH');
        //Switch to Table view and check result
        await workbenchPage.selectViewTypeTable();
        await t.switchToIframe(workbenchPage.iframe);
        await t.expect(await workbenchPage.queryTableResult.exists).ok('The table view is not switched for command FT.SEARCH');
    });
test
    .meta({ env: env.web })('Verify that user can switches between Table and Text for FT.AGGREGATE and see results corresponding to their views', async t => {
        const aggregateCommand = `FT.Aggregate ${indexName} * GROUPBY 0 REDUCE MAX 1 @price AS max_price`;
        //Send FT.AGGREGATE and switch to Text view
        await workbenchPage.sendCommandInWorkbench(aggregateCommand);
        await workbenchPage.selectViewTypeText();
        await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).visible).ok('The text view is not switched for command FT.AGGREGATE');
        //Switch to Table view and check result
        await workbenchPage.selectViewTypeTable();
        await t.switchToIframe(workbenchPage.iframe);
        await t.expect(await workbenchPage.queryTableResult.exists).ok('The table view is not switched for command FT.AGGREGATE');
    });
// skip due to inaccessibility of CLIENT LIST in plugin
test.skip
    .meta({ env: env.web })('Verify that user can switches between views and see results according to this view in full mode in Workbench', async t => {
        const command = 'CLIENT LIST';
        //Send command and check table view is default in full mode
        await workbenchPage.sendCommandInWorkbench(command);
        await t.click(workbenchPage.fullScreenButton);
        await t.switchToIframe(workbenchPage.iframe);
        await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTableResult).visible).ok('The search results are displayed in Table view by default');
        //Select Text view from dropdown
        await t.switchToMainWindow();
        await workbenchPage.selectViewTypeText();
        //Verify that search results are displayed in Text view
        await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).visible).ok('The result is displayed in Text view');
    });
