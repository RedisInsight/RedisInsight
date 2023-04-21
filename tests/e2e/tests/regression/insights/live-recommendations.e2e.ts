import { BrowserPage, InsightsPage, MemoryEfficiencyPage, MyRedisDatabasePage } from '../../../pageObjects';
import { RecommendationIds, rte } from '../../../helpers/constants';
import { acceptLicenseTerms, acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { commonUrl, ossStandaloneConfig, ossStandaloneV5Config } from '../../../helpers/conf';
import {
    addNewStandaloneDatabasesApi,
    deleteStandaloneDatabaseApi,
    deleteStandaloneDatabasesApi
} from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { Telemetry } from '../../../helpers/telemetry';
import { RecommendationsActions } from '../../../common-actions/recommendations-actions';

const myRedisDatabasePage = new MyRedisDatabasePage();
const common = new Common();
const browserPage = new BrowserPage();
const insightsPage = new InsightsPage();
const telemetry = new Telemetry();
const memoryEfficiencyPage = new MemoryEfficiencyPage();
const recommendationsActions = new RecommendationsActions();

const databasesForAdding = [
    { host: ossStandaloneV5Config.host, port: ossStandaloneV5Config.port, databaseName: ossStandaloneV5Config.databaseName },
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: ossStandaloneConfig.databaseName }
];
const tenSecondsTimeout = 10000;
let keyName = `recomKey-${common.generateWord(10)}`;
const logger = telemetry.createLogger();
const telemetryEvent = 'INSIGHTS_RECOMMENDATIONS_VOTE';
const expectedProperties = [
    'databaseId',
    'name',
    'vote'
];
const redisVersionRecom = RecommendationIds.redisVersion;
const redisTimeSeriesRecom = RecommendationIds.optimizeTimeSeries;
const searchVisualizationRecom = RecommendationIds.searchVisualization;
const setPasswordRecom = RecommendationIds.setPassword;

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
        await insightsPage.toggleInsightsPanel(false);
        await browserPage.OverviewPanel.changeDbIndex(0);
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabasesApi(databasesForAdding);
    })('Verify Insights panel Recommendations displaying', async t => {
        keyName = common.generateWord(10);

        await insightsPage.toggleInsightsPanel(true);
        // Verify that "Welcome to recommendations" panel displayed when there are no recommendations
        await t
            .expect(insightsPage.noRecommendationsScreen.exists).ok('No recommendations panel not displayed')
            .expect(insightsPage.noRecommendationsScreen.textContent).contains('Welcome to recommendations', 'Welcome to recommendations text not displayed');

        // Verify that user can redirect to Database Analysis page by clicking on button
        await t.click(insightsPage.goToDbAnalysisButton);
        await t.expect(memoryEfficiencyPage.noReportsText.visible).ok('Database analysis page not opened');

        await insightsPage.toggleInsightsPanel(false);
        // Go to 2nd database
        await t.click(browserPage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[0].databaseName);
        await insightsPage.toggleInsightsPanel(true);
        // Verify that live recommendations displayed for each database separately
        // Verify that user can see the live recommendation "Update Redis database" when Redis database is less than 6.0 highlighted as RedisStack
        await t
            .expect(await insightsPage.isRecommendationExists(redisVersionRecom)).ok('Redis Version recommendation not displayed')
            .expect(await insightsPage.isRecommendationExists(redisTimeSeriesRecom)).notOk('Optimize Time Series recommendation displayed');
        await insightsPage.toggleInsightsPanel(false);

        // Create Sorted Set with TimeSeries value
        await browserPage.addZSetKey(keyName, '151153320500121', '231231251', '1511533205001:21');
        // Verify that the list of recommendations updated every 10 seconds
        await t.wait(tenSecondsTimeout);
        await insightsPage.toggleInsightsPanel(true);
        // Verify that user can see the live recommendation "Optimize the use of time series"
        await t.expect(await insightsPage.isRecommendationExists(redisTimeSeriesRecom)).ok('Optimize Time Series recommendation not displayed');
    });
test
    .requestHooks(logger)
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
    }).after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
    })('Verify that user can upvote recommendations', async t => {
        await insightsPage.toggleInsightsPanel(true);
        await recommendationsActions.voteForRecommendation(redisVersionRecom, 'not-useful');
        // Verify that user can rate recommendations with one of 3 existing types at the same time
        await recommendationsActions.verifyVoteDisabled(redisVersionRecom, 'not-useful');

        // Verify that user can see the popup with link when he votes for “Not useful”
        await t.expect(memoryEfficiencyPage.recommendationsFeedbackBtn.visible).ok('popup did not appear after voting for not useful');

        // Verify that the INSIGHTS_RECOMMENDATIONS_VOTED event sent with Database ID, Recommendation_name, Vote type parameters when user voted for recommendation
        await telemetry.verifyEventHasProperties(telemetryEvent, expectedProperties, logger);
        await telemetry.verifyEventPropertyValue(telemetryEvent, 'name', redisVersionRecom, logger);
        await telemetry.verifyEventPropertyValue(telemetryEvent, 'vote', 'not useful', logger);

        // Verify that user can see previous votes when reload the page
        await common.reloadPage();
        await insightsPage.toggleInsightsPanel(true);
        await insightsPage.toggleRecommendation(redisVersionRecom, true);
        await recommendationsActions.verifyVoteDisabled(redisVersionRecom, 'not-useful');
    });
test('Verify that user can hide recommendations and checkbox value is saved', async t => {
    const commandToGetRecommendation = 'FT.INFO';
    await browserPage.Cli.sendCommandInCli(commandToGetRecommendation);

    await insightsPage.toggleInsightsPanel(true);
    await insightsPage.toggleShowHiddenRecommendations(false);
    await insightsPage.hideRecommendation(searchVisualizationRecom);
    await t.expect(await insightsPage.isRecommendationExists(searchVisualizationRecom)).notOk('recommendation is displayed when show hide recommendation is unchecked');

    // check recommendation state is saved after reload
    await common.reloadPage();
    await insightsPage.toggleInsightsPanel(true);
    await t.expect(await insightsPage.isRecommendationExists(searchVisualizationRecom)).notOk('recommendation is displayed when show hide recommendation is unchecked');

    // check value saved to show hidden recommendations
    await insightsPage.toggleShowHiddenRecommendations(true);
    await t.expect(await insightsPage.isRecommendationExists(searchVisualizationRecom)).ok('recommendation is not displayed when show hide recommendation is checked');
    await common.reloadPage();
    await insightsPage.toggleInsightsPanel(true);
    await t.expect(await insightsPage.isRecommendationExists(searchVisualizationRecom)).ok('recommendation is not displayed when show hide recommendation is checked');
});
test('Verify that user can snooze recommendation', async t => {
    const commandToGetRecommendation = 'FT.INFO';
    await browserPage.Cli.sendCommandInCli(commandToGetRecommendation);

    await insightsPage.toggleInsightsPanel(true);
    await insightsPage.snoozeRecommendation(searchVisualizationRecom);

    await common.reloadPage();
    await insightsPage.toggleInsightsPanel(true);
    await t.expect(await insightsPage.isRecommendationExists(searchVisualizationRecom)).notOk('recommendation is displayed when after snoozing');
    await insightsPage.toggleInsightsPanel(false);
    await browserPage.Cli.sendCommandInCli(commandToGetRecommendation);
    await insightsPage.toggleInsightsPanel(true);
    await t.expect(await insightsPage.isRecommendationExists(searchVisualizationRecom)).ok('recommendation is not displayed again');
});
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
    }).after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
    })('Verify that recommendations from database analysis are displayed in Insight panel above live recommendations', async t => {
        const redisVersionRecomSelector = insightsPage.getRecommendationByName(redisVersionRecom);

        await insightsPage.toggleInsightsPanel(true);
        // Verify that live recommendation displayed in Insights panel
        await t.expect(await insightsPage.isRecommendationExists(redisVersionRecom)).ok(`${redisVersionRecom} recommendation not displayed`);
        // Verify that recommendation from db analysis not displayed in Insights panel
        await t.expect(await insightsPage.isRecommendationExists(setPasswordRecom)).notOk(`${setPasswordRecom} recommendation displayed`);
        await insightsPage.toggleInsightsPanel(false);
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.NavigationPanel.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        await insightsPage.toggleInsightsPanel(true);
        // Verify that recommendations are synchronized
        await t.expect(await insightsPage.isRecommendationExists(setPasswordRecom)).ok('Recommendations are not synchronized');
        // Verify that duplicates are not displayed
        await t.expect(redisVersionRecomSelector.count).eql(1, `${redisVersionRecom} recommendation duplicated`);
    });
