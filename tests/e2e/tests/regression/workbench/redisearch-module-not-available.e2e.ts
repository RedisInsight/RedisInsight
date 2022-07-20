import { ClientFunction } from 'testcafe';
import { env, rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneV5Config } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const commandForSend = 'FT._LIST';
const getPageUrl = ClientFunction(() => window.location.href);

fixture `Redisearch module not available`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async(t) => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
    })
test
    .meta({ env: env.web, rte: rte.standalone })
    ('Verify that user can see the "Create your free Redis database with RediSearch on Redis Cloud" button and click on it in Workbench when module in not loaded', async t => {
        //Send command with 'FT.'
        await workbenchPage.sendCommandInWorkbench(commandForSend);
        //Verify the button in the results
        await t.expect(await workbenchPage.queryCardNoModuleButton.visible).ok('The "Create your free Redis database with RediSearch on Redis Cloud" button is visible');
        //Click on the button in the results
        await t.click(workbenchPage.queryCardNoModuleButton);
        await t.expect(getPageUrl()).contains('https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redisearch', 'The Try Redis Enterprise page is opened');
        await t.switchToParentWindow();
    });
