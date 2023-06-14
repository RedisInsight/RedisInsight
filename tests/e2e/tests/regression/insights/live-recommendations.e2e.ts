import * as path from 'path';
import { BrowserPage, MemoryEfficiencyPage, MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { RecommendationIds, rte } from '../../../helpers/constants';
import { acceptLicenseTerms } from '../../../helpers/database';
import { commonUrl, ossStandaloneConfig, ossStandaloneV5Config } from '../../../helpers/conf';
import {
    addNewStandaloneDatabaseApi,
    addNewStandaloneDatabasesApi,
    deleteStandaloneDatabaseApi,
    deleteStandaloneDatabasesApi
} from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { Telemetry } from '../../../helpers/telemetry';
import { RecommendationsActions } from '../../../common-actions/recommendations-actions';
import { modifyFeaturesConfigJson, refreshFeaturesTestData, updateControlNumber } from '../../../helpers/insights';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const workbenchPage = new WorkbenchPage();
const telemetry = new Telemetry();
const memoryEfficiencyPage = new MemoryEfficiencyPage();
const recommendationsActions = new RecommendationsActions();

const databasesForAdding = [
    { host: ossStandaloneV5Config.host, port: ossStandaloneV5Config.port, databaseName: ossStandaloneV5Config.databaseName },
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: ossStandaloneConfig.databaseName }
];
const tenSecondsTimeout = 10000;
const keyName = `recomKey-${Common.generateWord(10)}`;
const logger = telemetry.createLogger();
const telemetryEvent = 'INSIGHTS_RECOMMENDATION_VOTED';
const expectedProperties = [
    'buildType',
    'databaseId',
    'name',
    'provider',
    'vote'
];
const featuresConfig = path.join('.', 'test-data', 'features-configs', 'insights-valid.json');
const redisVersionRecom = RecommendationIds.redisVersion;
const redisTimeSeriesRecom = RecommendationIds.optimizeTimeSeries;
const searchVisualizationRecom = RecommendationIds.searchVisualization;
const setPasswordRecom = RecommendationIds.setPassword;

fixture `Live Recommendations`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
        await refreshFeaturesTestData();
        await modifyFeaturesConfigJson(featuresConfig);
        await updateControlNumber(47.2);
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await myRedisDatabasePage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        await refreshFeaturesTestData();
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .before(async() => {
        // Add new databases using API
        await acceptLicenseTerms();
        await refreshFeaturesTestData();
        await modifyFeaturesConfigJson(featuresConfig);
        await updateControlNumber(47.2);
        await addNewStandaloneDatabasesApi(databasesForAdding);
        // Reload Page
        await myRedisDatabasePage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[1].databaseName);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.InsightsPanel.toggleInsightsPanel(false);
        await refreshFeaturesTestData();
        await browserPage.OverviewPanel.changeDbIndex(0);
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabasesApi(databasesForAdding);
    })('Verify Insights panel Recommendations displaying', async t => {
        await browserPage.InsightsPanel.toggleInsightsPanel(true);
        // Verify that "Welcome to recommendations" panel displayed when there are no recommendations
        await t
            .expect(browserPage.InsightsPanel.noRecommendationsScreen.exists).ok('No recommendations panel not displayed')
            .expect(browserPage.InsightsPanel.noRecommendationsScreen.textContent).contains('Welcome toInsights', 'Welcome to recommendations text not displayed');

        await browserPage.InsightsPanel.toggleInsightsPanel(false);
        // Go to 2nd database
        await t.click(browserPage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[0].databaseName);
        await browserPage.InsightsPanel.toggleInsightsPanel(true);
        // Verify that live recommendations displayed for each database separately
        // Verify that user can see the live recommendation "Update Redis database" when Redis database is less than 6.0 highlighted as RedisStack
        await t
            .expect(await browserPage.InsightsPanel.getRecommendationByName(redisVersionRecom).visible).ok('Redis Version recommendation not displayed')
            .expect(await browserPage.InsightsPanel.getRecommendationByName(redisTimeSeriesRecom).visible).notOk('Optimize Time Series recommendation displayed');
        await browserPage.InsightsPanel.toggleInsightsPanel(false);

        // Create Sorted Set with TimeSeries value
        await browserPage.addZSetKey(keyName, '151153320500121', '231231251', '1511533205001:21');
        // Verify that the list of recommendations updated every 10 seconds
        await t.wait(tenSecondsTimeout);
        await browserPage.InsightsPanel.toggleInsightsPanel(true);
        // Verify that user can see the live recommendation "Optimize the use of time series"
        await t.expect(await browserPage.InsightsPanel.getRecommendationByName(redisTimeSeriesRecom).visible).ok('Optimize Time Series recommendation not displayed');
    });
test
    .requestHooks(logger)
    .before(async() => {
        await acceptLicenseTerms();
        await refreshFeaturesTestData();
        await modifyFeaturesConfigJson(featuresConfig);
        await updateControlNumber(47.2);
        await addNewStandaloneDatabaseApi(ossStandaloneV5Config);
        await myRedisDatabasePage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
    }).after(async() => {
        await refreshFeaturesTestData();
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
    })('Verify that user can upvote recommendations', async() => {
        const notUsefulVoteOption = 'not useful';
        const usefulVoteOption = 'useful';
        await browserPage.InsightsPanel.toggleInsightsPanel(true);
        await recommendationsActions.voteForRecommendation(redisVersionRecom, notUsefulVoteOption);
        // Verify that user can rate recommendations with one of 2 existing types at the same time
        await recommendationsActions.verifyVoteIsSelected(redisVersionRecom, notUsefulVoteOption);

        // Verify that user can see the popup with link when he votes for “Not useful”
        await recommendationsActions.verifyVotePopUpIsDisplayed(redisVersionRecom, notUsefulVoteOption);

        // Verify that the INSIGHTS_RECOMMENDATIONS_VOTED event sent with Database ID, Recommendation_name, Vote type parameters when user voted for recommendation
        await telemetry.verifyEventHasProperties(telemetryEvent, expectedProperties, logger);
        await telemetry.verifyEventPropertyValue(telemetryEvent, 'name', 'updateDatabase', logger);
        await telemetry.verifyEventPropertyValue(telemetryEvent, 'vote', notUsefulVoteOption, logger);

        // Verify that user can see previous votes when reload the page
        await browserPage.reloadPage();
        await browserPage.InsightsPanel.toggleInsightsPanel(true);
        await browserPage.InsightsPanel.toggleRecommendation(redisVersionRecom, true);
        await recommendationsActions.verifyVoteIsSelected(redisVersionRecom, notUsefulVoteOption);

        // Verify that user can change previous votes
        await recommendationsActions.voteForRecommendation(redisVersionRecom, usefulVoteOption);
        // Verify that user can rate recommendations with one of 2 existing types at the same time
        await recommendationsActions.verifyVoteIsSelected(redisVersionRecom, usefulVoteOption);
    });
test('Verify that user can hide recommendations and checkbox value is saved', async t => {
    const commandToGetRecommendation = 'FT.INFO';
    await browserPage.Cli.sendCommandInCli(commandToGetRecommendation);

    await browserPage.InsightsPanel.toggleInsightsPanel(true);
    await browserPage.InsightsPanel.toggleShowHiddenRecommendations(false);
    await browserPage.InsightsPanel.hideRecommendation(searchVisualizationRecom);
    await t.expect(await browserPage.InsightsPanel.getRecommendationByName(searchVisualizationRecom).exists)
        .notOk('recommendation is displayed when show hide recommendation is unchecked');

    // check recommendation state is saved after reload
    await browserPage.reloadPage();
    await browserPage.InsightsPanel.toggleInsightsPanel(true);
    await t.expect(await browserPage.InsightsPanel.getRecommendationByName(searchVisualizationRecom).exists)
        .notOk('recommendation is displayed when show hide recommendation is unchecked');

    // check value saved to show hidden recommendations
    await browserPage.InsightsPanel.toggleShowHiddenRecommendations(true);
    await t.expect(await browserPage.InsightsPanel.getRecommendationByName(searchVisualizationRecom).visible)
        .ok('recommendation is not displayed when show hide recommendation is checked');
    await browserPage.reloadPage();
    await browserPage.InsightsPanel.toggleInsightsPanel(true);
    await t.expect(await browserPage.InsightsPanel.getRecommendationByName(searchVisualizationRecom).visible)
        .ok('recommendation is not displayed when show hide recommendation is checked');
});
test('Verify that user can snooze recommendation', async t => {
    const commandToGetRecommendation = 'FT.INFO';
    await browserPage.Cli.sendCommandInCli(commandToGetRecommendation);

    await browserPage.InsightsPanel.toggleInsightsPanel(true);
    await browserPage.InsightsPanel.snoozeRecommendation(searchVisualizationRecom);

    await browserPage.reloadPage();
    await browserPage.InsightsPanel.toggleInsightsPanel(true);
    await t.expect(await browserPage.InsightsPanel.getRecommendationByName(searchVisualizationRecom).visible)
        .notOk('recommendation is displayed when after snoozing');
    await browserPage.InsightsPanel.toggleInsightsPanel(false);
    await browserPage.Cli.sendCommandInCli(commandToGetRecommendation);
    await browserPage.InsightsPanel.toggleInsightsPanel(true);
    await t.expect(await browserPage.InsightsPanel.getRecommendationByName(searchVisualizationRecom).visible).ok('recommendation is not displayed again');
});
test
    .before(async() => {
        await acceptLicenseTerms();
        await refreshFeaturesTestData();
        await modifyFeaturesConfigJson(featuresConfig);
        await updateControlNumber(47.2);
        await addNewStandaloneDatabaseApi(ossStandaloneV5Config);
        await myRedisDatabasePage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
    }).after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        await refreshFeaturesTestData();
    })('Verify that recommendations from database analysis are displayed in Insight panel above live recommendations', async t => {
        const redisVersionRecomSelector = browserPage.InsightsPanel.getRecommendationByName(redisVersionRecom);

        await browserPage.InsightsPanel.toggleInsightsPanel(true);
        // Verify that live recommendation displayed in Insights panel
        await t.expect(await browserPage.InsightsPanel.getRecommendationByName(redisVersionRecom).visible).ok(`${redisVersionRecom} recommendation not displayed`);
        // Verify that recommendation from db analysis not displayed in Insights panel
        await t.expect(await browserPage.InsightsPanel.getRecommendationByName(setPasswordRecom).visible).notOk(`${setPasswordRecom} recommendation displayed`);
        await browserPage.InsightsPanel.toggleInsightsPanel(false);
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.NavigationPanel.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        await browserPage.InsightsPanel.toggleInsightsPanel(true);
        // Verify that recommendations are synchronized
        await t.expect(await browserPage.InsightsPanel.getRecommendationByName(setPasswordRecom).visible).ok('Recommendations are not synchronized');
        // Verify that duplicates are not displayed
        await t.expect(redisVersionRecomSelector.count).eql(1, `${redisVersionRecom} recommendation duplicated`);
    });
//https://redislabs.atlassian.net/browse/RI-4413
test('Verify that if user clicks on the Analyze button and link, the pop up with analyze button is displayed and new report is generated', async t => {
    await browserPage.InsightsPanel.toggleInsightsPanel(true);
    await t.click(browserPage.InsightsPanel.analyzeDatabaseButton);
    await t.click(browserPage.InsightsPanel.analyzeTooltipButton);
    //Verify that user is navigated to DB Analysis page via Analyze button and new report is generated
    await t.click(memoryEfficiencyPage.selectedReport);
    await t.expect(memoryEfficiencyPage.reportItem.visible).ok('Database analysis page not opened');
    await t.click(memoryEfficiencyPage.NavigationPanel.workbenchButton);
    await workbenchPage.InsightsPanel.toggleInsightsPanel(true);
    await t.click(workbenchPage.InsightsPanel.analyzeDatabaseLink);
    await t.click(workbenchPage.InsightsPanel.analyzeTooltipButton);
    //Verify that user is navigated to DB Analysis page via Analyze link and new report is generated
    await t.click(memoryEfficiencyPage.selectedReport);
    await t.expect(memoryEfficiencyPage.reportItem.count).eql(2, 'report was not generated');
});
//https://redislabs.atlassian.net/browse/RI-4493
test
    .after(async() => {
        await refreshFeaturesTestData();
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabasesApi(databasesForAdding);
    })('Verify that key name is displayed for Insights and DA recommendations', async t => {
        const cliCommand = `JSON.SET ${keyName} $ '{ "model": "Hyperion", "brand": "Velorim"}'`;
        await browserPage.Cli.sendCommandInCli(cliCommand);
        await t.click(browserPage.refreshKeysButton);
        await browserPage.InsightsPanel.toggleInsightsPanel(true);
        let keyNameFromRecommendation = await browserPage.InsightsPanel.getRecommendationByName(RecommendationIds.searchJson)
            .find(browserPage.InsightsPanel.cssKeyName)
            .innerText;
        await t.expect(keyNameFromRecommendation).eql(keyName);
        await t.click(workbenchPage.InsightsPanel.analyzeDatabaseLink);
        await t.click(workbenchPage.InsightsPanel.analyzeTooltipButton);
        await t.click(memoryEfficiencyPage.recommendationsTab);
        await memoryEfficiencyPage.getRecommendationButtonByName(RecommendationIds.searchJson);
        keyNameFromRecommendation = await browserPage.InsightsPanel.getRecommendationByName(RecommendationIds.searchJson)
            .find(browserPage.InsightsPanel.cssKeyName)
            .innerText;
        await t.expect(keyNameFromRecommendation).eql(keyName);
        await t.click(memoryEfficiencyPage.NavigationPanel.browserButton);
    });
