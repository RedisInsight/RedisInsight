import { ClientFunction } from 'testcafe';
import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    WorkbenchPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneV5Config
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const commandForSend = 'FT._LIST';
const getPageUrl = ClientFunction(() => window.location.href);

fixture `Redisearch module not available`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneV5Config);
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
test
    .meta({ rte: 'standalone' })
    ('Verify that user can see the "Create your free Redis database with RediSearch on Redis Cloud" button and click on it in Workbench when module in not loaded', async t => {
        //Send command with 'FT.'
        await workbenchPage.sendCommandInWorkbench(commandForSend);
        //Verify the button in the results
        await t.expect(await workbenchPage.queryCardNoModuleButton.visible).ok('The "Create your free Redis database with RediSearch on Redis Cloud" button is visible');
        //Click on the button in the results
        await t.click(workbenchPage.queryCardNoModuleButton);
        await t.expect(getPageUrl()).contains('https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redisearch', 'The Try Redis Enterprise page is opened');
    });
