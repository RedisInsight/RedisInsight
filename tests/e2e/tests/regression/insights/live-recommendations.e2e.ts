import { MyRedisDatabasePage, BrowserPage, InsightsPage, DatabaseOverviewPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTerms, acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { commonUrl, ossStandaloneConfig, ossStandaloneV5Config } from '../../../helpers/conf';
import { addNewStandaloneDatabasesApi, deleteStandaloneDatabaseApi, deleteStandaloneDatabasesApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const common = new Common();
const browserPage = new BrowserPage();
const insightsPage = new InsightsPage();
const databaseOverviewPage = new DatabaseOverviewPage();

const databasesForAdding = [
    { host: ossStandaloneV5Config.host, port: ossStandaloneV5Config.port, databaseName: ossStandaloneV5Config.databaseName },
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: ossStandaloneConfig.databaseName }
];
const tenSecondsTimeout = 10000;
let keyName = `recomKey-${common.generateWord(10)}`;

fixture `Live Recommendations`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .before(async() => {
        // Add new databases using API
        await acceptLicenseTerms();
        await addNewStandaloneDatabasesApi(databasesForAdding);
        // Reload Page
        await common.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[1].databaseName);
    })
    .after(async() => {
        // Clear and delete database
        await insightsPage.closeInsightsPanel();
        await databaseOverviewPage.changeDbIndex(0);
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabasesApi(databasesForAdding);
    })('Verify Insights panel Recommendations displaying', async t => {
        keyName = common.generateWord(10);

        await insightsPage.openInsightsPanel();
        // Verify that "Welcome to recommendations" panel displayed when there are no recommendations
        await t
            .expect(insightsPage.noRecommendationsScreen.exists).ok('No recommendations panel not displayed')
            .expect(insightsPage.noRecommendationsScreen.textContent).contains('Welcome to recommendations', 'Welcome to recommendations text not displayed');

        await insightsPage.closeInsightsPanel();
        // Go to 2nd database
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[0].databaseName);
        await insightsPage.openInsightsPanel();
        // Verify that live recommendations displayed for each database separately
        // Verify that user can see the live recommendation "Update Redis database" when Redis database is less than 6.0 highlighted as RedisStack
        await t
            .expect(insightsPage.redisVersionRecommendation.exists).ok('Update Redis Version recommendation not displayed')
            .expect(insightsPage.optimizeTimeSeriesRecommendation.exists).notOk('Optimize Time Series recommendation displayed');
        await insightsPage.closeInsightsPanel();

        // Create Sorted Set with TimeSeries value
        await browserPage.addZSetKey(keyName, '151153320500121', '231231251', '1511533205001:21');
        // Verify that the list of recommendations updated every 10 seconds
        await t.wait(tenSecondsTimeout);
        await insightsPage.openInsightsPanel();
        // Verify that user can see the live recommendation "Optimize the use of time series"
        await t.expect(insightsPage.optimizeTimeSeriesRecommendation.exists).ok('Optimize Time Series recommendation not displayed');

        await insightsPage.closeInsightsPanel();
        await databaseOverviewPage.changeDbIndex(1);
        await insightsPage.openInsightsPanel();
        // Verify that live recommendations displayed for each logical database separately
        await t
            .expect(insightsPage.redisVersionRecommendation.exists).ok('Update Redis Version recommendation not displayed')
            .expect(insightsPage.optimizeTimeSeriesRecommendation.exists).notOk('Optimize Time Series recommendation displayed in logical db without zSets');
    });
