import { ClientFunction } from 'testcafe';
import { env, rte } from '../../../helpers/constants';
import { acceptLicenseTerms, addNewStandaloneDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteAllDatabasesApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browsePage  = new BrowserPage();
const getPageUrl = ClientFunction(() => window.location.href);
const sourcePage = 'https://developer.redis.com/create/from-source/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight';
const dockerPage = 'https://developer.redis.com/create/docker/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight';
const homebrewPage = 'https://developer.redis.com/create/homebrew/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight';
const promoPage = 'https://redis.com/redis-enterprise-cloud/overview/?utm_source=redisinsight&utm_medium=main&utm_campaign=main';

fixture `Add database from welcome page`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
        await deleteAllDatabasesApi();
        // Reload Page
        await browsePage.reloadPage();
    });
test
    .after(async() => {
        // Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })('Verify that user can add first DB from Welcome page', async t => {
        await t.expect(myRedisDatabasePage.AddRedisDatabase.welcomePageTitle.exists).ok('The welcome page title not displayed');
        // Add database from Welcome page
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).exists).ok('The database not added', { timeout: 10000 });
    });
test
    .meta({ env: env.web })('Verify that all the links are valid from Welcome page', async t => {
        // Verify build from source link
        await t.click(myRedisDatabasePage.AddRedisDatabase.buildFromSource);
        await t.expect(getPageUrl()).eql(sourcePage, 'Build from source link is not valid');
        await t.switchToParentWindow();
        // Verify build from docker link
        await t.click(myRedisDatabasePage.AddRedisDatabase.buildFromDocker);
        await t.expect(getPageUrl()).eql(dockerPage, 'Build from docker page is not valid');
        await t.switchToParentWindow();
        // Verify build from homebrew link
        await t.click(myRedisDatabasePage.AddRedisDatabase.buildFromHomebrew);
        await t.expect(getPageUrl()).eql(homebrewPage, 'Build from homebrew page is not valid');
        await t.switchToParentWindow();
        // Verify promo button link
        await t.click(myRedisDatabasePage.promoButton);
        await t.expect(getPageUrl()).eql(promoPage, 'Promotion link is not valid');
    });
