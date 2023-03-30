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
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
    });
// Skipped as outdated after implementing RI-4230
test.skip
    .meta({ env: env.web, rte: rte.standalone })('Verify that user can see the "Create your free Redis database with RediSearch on Redis Cloud" button and click on it in Workbench when module in not loaded', async t => {
        const link = 'https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redisearch';

        // Send command with 'FT.'
        await workbenchPage.sendCommandInWorkbench(commandForSend);
        // Verify the button in the results
        await t.expect(await workbenchPage.queryCardNoModuleButton.visible).ok('The "Create your free Redis database with RediSearch on Redis Cloud" button is not visible');
        // Click on the button in the results
        await t.click(workbenchPage.queryCardNoModuleButton);
        await t.expect(getPageUrl()).contains(link, 'The Try Redis Enterprise page is not opened');
        await t.switchToParentWindow();
    });
// https://redislabs.atlassian.net/browse/RI-4230
test
    .meta({ env: env.web, rte: rte.standalone })
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
    })('Verify that user can see options on what can be done to work with capabilities in Workbench for docker', async t => {
        const commandJSON = 'JSON.ARRAPPEND key value';
        const commandFT = 'FT.LIST';
        await workbenchPage.sendCommandInWorkbench(commandJSON);
        // Verify change screens when capability not available - 'Search'
        await t.expect(workbenchPage.welcomePageTitle.withText('Looks like RedisJSON is not available').visible)
            .ok('Missing RedisJSON title is not visible');
        await workbenchPage.sendCommandInWorkbench(commandFT);
        // Verify  change screens when  capability not available - 'JSON'
        await t.expect(workbenchPage.welcomePageTitle.withText('Looks like RediSearch is not available').visible)
            .ok('Missing RedisJSON title is not visible');
    });
