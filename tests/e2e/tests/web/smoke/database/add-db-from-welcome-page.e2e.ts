import { ClientFunction } from 'testcafe';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage, BrowserPage, WelcomePage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { goBackHistory } from '../../../../helpers/utils';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browsePage  = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const welcomePage = new WelcomePage();

const getPageUrl = ClientFunction(() => window.location.href);
const linuxPage = 'https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/linux/?utm_source=redisinsight&utm_medium=main&utm_campaign=linux';
const dockerPage = 'https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/docker/?utm_source=redisinsight&utm_medium=main&utm_campaign=docker';
const homebrewPage = 'https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/mac-os/?utm_source=redisinsight&utm_medium=main&utm_campaign=homebrew';
const promoPage = 'https://redis.io/try-free/?utm_source=redisinsight&utm_medium=main&utm_campaign=main';

fixture `Add database from welcome page`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.deleteAllDatabasesApi();
        // Reload Page
        await browsePage.reloadPage();
    });
test
    .after(async() => {
        // Delete database
        await databaseHelper.deleteDatabase(ossStandaloneConfig.databaseName);
    })('Verify that user can add first DB from Welcome page', async t => {
        await t.expect(welcomePage.welcomePageTitle.exists).ok('The welcome page title not displayed');
        // Add database from Welcome page
        await databaseHelper.addNewStandaloneDatabase(ossStandaloneConfig);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).exists).ok('The database not added', { timeout: 10000 });
    });

test('Verify that all the links are valid from Welcome page', async t => {
    // Verify linux link
    await t.click(welcomePage.buildFromLinux);
    await t.expect(getPageUrl()).eql(linuxPage, 'Build for linux link is not valid');
    await goBackHistory();
    // Verify build from docker link
    await t.click(welcomePage.buildFromDocker);
    await t.expect(getPageUrl()).eql(dockerPage, 'Build from docker page is not valid');
    await goBackHistory();
    // Verify build from homebrew link
    await t.click(welcomePage.buildFromHomebrew);
    await t.expect(getPageUrl()).eql(homebrewPage, 'Build from homebrew page is not valid');
    await goBackHistory();
    // Verify promo button link
    await t.click(welcomePage.tryRedisCloudBtn);
    await t.expect(getPageUrl()).eql(promoPage, 'Promotion link is not valid');
});
