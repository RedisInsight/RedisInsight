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
    .meta({type: 'smoke'})
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
    .meta({env: 'web', rte: rte.standalone })
    ('Verify that user can execute redisearch command for JSON data type in Workbench', async t => {
        const commandsForSend = [
            `FT.CREATE ${indexName} ON JSON SCHEMA $.title AS title TEXT`,
            `JSON.SET myDoc $ '{"title": "foo", "content": "bar"}'`
        ];
        const searchCommand = `FT.SEARCH ${indexName} "@title:foo"`;
        //Send commands for add JSON document and create index
        await workbenchPage.sendCommandInWorkbench(commandsForSend.join('\n'));
        //Verify that the commandsForSend are executed
        for(const command of commandsForSend) {
            await t.expect((await workbenchPage.getCardContainerByCommand(command)).textContent).contains('OK', `The ${command} command is executed`);
        }
        //Send search command to find JSON document
        await workbenchPage.sendCommandInWorkbench(searchCommand);
        //Verify that the search command is executed
        await t.expect((await workbenchPage.getCardContainerByCommand(searchCommand)).textContent).contains('{"title":"foo","content":"bar"}', `The ${searchCommand} command is executed`);
    });
