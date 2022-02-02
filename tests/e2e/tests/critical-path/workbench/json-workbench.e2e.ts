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
import { rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const indexName = 'userIdx';

fixture `JSON verifications at Workbench`
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
    .meta({ env: 'web', rte: rte.standalone })
    ('Verify that user can see result in Table and Text view for JSON data types for FT.AGGREGATE command in Workbench', async t => {
        const commandsForSend = [
            `FT.CREATE ${indexName} ON JSON SCHEMA $.user.name AS name TEXT $.user.tag AS country TAG`,
            `JSON.SET myDoc1 $ '{"user":{"name":"John Smith","tag":"foo,bar","hp":1000, "dmg":150}}'`,
            `JSON.SET myDoc2 $ '{"user":{"name":"John Smith","tag":"foo,bar","hp":500, "dmg":300}}'`
        ];
        const searchCommand = 'FT.AGGREGATE userIdx "*" LOAD 6 $.user.hp AS hp $.user.dmg AS dmg APPLY "@hp-@dmg" AS points';
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
