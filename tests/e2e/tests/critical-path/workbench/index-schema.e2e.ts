import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    WorkbenchPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneRedisearch
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const indexName = 'products';

fixture `Index Schema at Workbench`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneRedisearch);
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneRedisearch.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async t => {
        //Drop index and documents
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
    })
//skipped due the inaccessibility of the iframe
test.skip
    .meta({ env: 'web', rte: 'standalone' })
    ('Verify that user can open results in Text and Table views for FT.INFO for Hash in Workbench', async t => {
        const commandsForSend = [
            `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA name TEXT`,
            `HMSET product:1 name "Apple Juice"`
        ];
        const searchCommand = `FT.INFO ${indexName}`;
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
//skipped due the inaccessibility of the iframe
test.skip
    .meta({ env: 'web',rte: 'standalone' })
    ('Verify that user can open results in Text and Table views for FT.INFO for JSON in Workbench', async t => {
        const commandsForSend = [
            `FT.CREATE ${indexName} ON JSON SCHEMA $.user.name AS name TEXT $.user.tag AS country TAG`,
            `JSON.SET myDoc1 $ '{"user":{"name":"John Smith","tag":"foo,bar","hp":1000, "dmg":150}}'`
        ];
        const searchCommand = `FT.INFO ${indexName}`;
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
