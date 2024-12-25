import { t } from 'testcafe';
import { commonUrl, ossStandaloneRedisGears } from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import { ExploreTabs, RecommendationIds, RedisOverviewPage } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';

const databaseHelper = new DatabaseHelper();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseAPIRequests = new DatabaseAPIRequests();
const browserPage = new BrowserPage();
const rdiInstancesListPage = new RdiInstancesListPage();

const rdiRecommendation = RecommendationIds.rdi;

//skip the tests until rdi integration is added
fixture.skip `Rdi recommendation`
    .meta({ type: 'critical_path', feature: 'rdi' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase);
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisGears);
    })
    .afterEach(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
    });
// it doesn't work until recommendation.json is not updated
test('Verify that rdi recommendation is displayed for oss cluster', async() => {
    await browserPage.NavigationHeader.togglePanel(true);
    const tab = await browserPage.InsightsPanel.setActiveTab(ExploreTabs.Tips);
    await t.expect(tab.getRecommendationByName(rdiRecommendation).exists).ok('Redis Version recommendation not displayed');
    await tab.clickOnNavigationButton(rdiRecommendation);

    await t.expect(rdiInstancesListPage.addRdiInstanceButton.exists).ok('Navigation for recommendation is not correct');
});
