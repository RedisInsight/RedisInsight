import * as path from 'path';
import { BrowserPage, MyRedisDatabasePage, SettingsPage } from '../../../pageObjects';
import { RecommendationIds, rte, env } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { commonUrl, ossStandaloneConfig, ossStandaloneV5Config } from '../../../helpers/conf';
import {
    addNewStandaloneDatabaseApi,
    deleteStandaloneDatabaseApi
} from '../../../helpers/api/api-database';
import { deleteRowsFromTableInDB, getColumnValueFromTableInDB } from '../../../helpers/database-scripts';
import { modifyFeaturesConfigJson, refreshFeaturesTestData, updateControlNumber } from '../../../helpers/insights';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const settingsPage = new SettingsPage();

const featuresConfigTable = 'features_config';
const redisVersionRecom = RecommendationIds.redisVersion;
const pathes = {
    defaultRemote: path.join('.', 'test-data', 'features-configs', 'insights-default-remote.json'),
    invalidConfig: path.join('.', 'test-data', 'features-configs', 'insights-invalid.json'),
    validConfig: path.join('.', 'test-data', 'features-configs', 'insights-valid.json'),
    analyticsConfig: path.join('.', 'test-data', 'features-configs', 'insights-analytics-filter-off.json'),
    buildTypeConfig: path.join('.', 'test-data', 'features-configs', 'insights-build-type-filter.json'),
    flagOffConfig: path.join('.', 'test-data', 'features-configs', 'insights-flag-off.json'),
    dockerConfig: path.join('.', 'test-data', 'features-configs', 'insights-docker-build.json'),
    electronConfig: path.join('.', 'test-data', 'features-configs', 'insights-electron-build.json')
};

fixture `Feature flag`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
        await refreshFeaturesTestData();
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        await refreshFeaturesTestData();
    });
test('Verify that default config applied when remote config version is lower', async t => {
    await updateControlNumber(19.2);

    const featureVersion = await JSON.parse(await getColumnValueFromTableInDB(featuresConfigTable, 'data')).version;

    await t.expect(featureVersion).eql(1, 'Config with lowest version applied');
    await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed when disabled in default config');
});
test('Verify that invaid remote config not applied even if its version is higher than in the default config', async t => {
    // Update remote config .json to invalid
    await modifyFeaturesConfigJson(pathes.invalidConfig);
    await updateControlNumber(19.2);

    const featureVersion = await JSON.parse(await getColumnValueFromTableInDB(featuresConfigTable, 'data')).version;

    await t.expect(featureVersion).eql(1, 'Config highest version not applied');
    await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed when disabled in default config');
});
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await addNewStandaloneDatabaseApi(ossStandaloneV5Config);
        await refreshFeaturesTestData();
    })
    .after(async t => {
        // Turn on telemetry
        await t.click(browserPage.NavigationPanel.settingsButton);
        await settingsPage.changeAnalyticsSwitcher(true);
        // Delete databases connections
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        // Update remote config .json to default
        await refreshFeaturesTestData();
    })('Verify that valid remote config applied with version higher than in the default config', async t => {
        // Update remote config .json to valid
        await modifyFeaturesConfigJson(pathes.validConfig);
        await updateControlNumber(48.2);
        let featureVersion = await JSON.parse(await getColumnValueFromTableInDB(featuresConfigTable, 'data')).version;
        let versionFromConfig = await Common.getJsonPropertyValue('version', pathes.validConfig);

        await t.expect(featureVersion).eql(versionFromConfig, 'Config with invalid data applied');
        // Verify that Insights panel displayed if user's controlNumber is in range from config file
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).ok('Insights panel not displayed when enabled from remote config');

        // Verify that recommendations displayed for all databases if option enabled
        await t.click(browserPage.OverviewPanel.myRedisDbIcon);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).ok('Insights panel not displayed for the other db connection');
        await browserPage.InsightsPanel.toggleInsightsPanel(true);
        await t.expect(browserPage.InsightsPanel.getRecommendationByName(redisVersionRecom).exists).ok('Redis Version recommendation not displayed');

        await browserPage.InsightsPanel.toggleInsightsPanel(false);
        // Verify that Insights panel can be displayed for Telemetry enabled/disabled according to filters
        await t.click(browserPage.NavigationPanel.settingsButton);
        await settingsPage.changeAnalyticsSwitcher(false);
        await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed without analytics when its filter is on');

        // Update remote config .json to config without analytics filter
        await modifyFeaturesConfigJson(pathes.analyticsConfig);
        await updateControlNumber(48.2);
        // Verify that Insights panel can be displayed for WebStack app according to filters
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).ok('Insights panel not displayed without analytics when its filter is off');

        // Verify that Insights panel not displayed if user's controlNumber is out of range from config file
        await updateControlNumber(30.1);
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed for user with control number out of the config');

        // Update remote config .json to config with buildType filter excluding current app build
        await modifyFeaturesConfigJson(pathes.buildTypeConfig);
        await updateControlNumber(48.2);
        // Verify that buildType filter applied
        featureVersion = await JSON.parse(await getColumnValueFromTableInDB(featuresConfigTable, 'data')).version;
        versionFromConfig = await Common.getJsonPropertyValue('version', pathes.buildTypeConfig);
        await t.expect(featureVersion).eql(versionFromConfig, 'Config highest version not applied');
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed when filter excludes this buildType');

        // Update remote config .json to config with insights feature disabled
        await modifyFeaturesConfigJson(pathes.flagOffConfig);
        await updateControlNumber(48.2);
        // Verify that Insights panel not displayed if the remote config file has it disabled
        featureVersion = await JSON.parse(await getColumnValueFromTableInDB(featuresConfigTable, 'data')).version;
        versionFromConfig = await Common.getJsonPropertyValue('version', pathes.flagOffConfig);
        await t.expect(featureVersion).eql(versionFromConfig, 'Config highest version not applied');
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed when filter excludes this buildType');
    });
test.only
    .meta({ env: env.desktop })
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
    })
    .after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        // Update remote config .json to default
        await modifyFeaturesConfigJson(pathes.defaultRemote);
        // Clear features config table
        await deleteRowsFromTableInDB(featuresConfigTable);
    })('Verify that Insights panel can be displayed for Electron app according to filters', async t => {
        // Update remote config .json to config with buildType filter excluding current app build
        await modifyFeaturesConfigJson(pathes.dockerConfig);
        await updateControlNumber(48.2);
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed when filter excludes this buildType');

        // Update remote config .json to config with buildType filter including current app build
        await modifyFeaturesConfigJson(pathes.electronConfig);
        await updateControlNumber(48.2);
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).ok('Insights panel not displayed when filter includes this buildType');
    });
