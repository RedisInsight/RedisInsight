import * as path from 'path';
import { BrowserPage, MyRedisDatabasePage, SettingsPage } from '../../../pageObjects';
import { RecommendationIds, rte, env } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { commonUrl, ossStandaloneConfig, ossStandaloneV5Config } from '../../../helpers/conf';
import {
    addNewStandaloneDatabaseApi,
    deleteStandaloneDatabaseApi
} from '../../../helpers/api/api-database';
import { syncFeaturesApi } from '../../../helpers/api/api-info';
import { deleteRowsFromTableInDB, getColumnValueFromTableInDB, updateColumnValueInDBTable } from '../../../helpers/database-scripts';
import { modifyFeaturesConfigJson } from '../../../helpers/insights';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const settingsPage = new SettingsPage();

const featuresConfigTable = 'features_config';
const updateControlNumber = async(number: number): Promise<void> => {
    updateColumnValueInDBTable(featuresConfigTable, 'controlNumber', number);
    await syncFeaturesApi();
    await browserPage.reloadPage();
};
const redisVersionRecom = RecommendationIds.redisVersion;
const pathes = {
    default: path.join('..', '..', 'redisinsight', 'api', 'config', 'features-config.json'),
    simpleRemote: path.join('.', 'remote', 'features-config.json'),
    invalidConfig: path.join('.', 'test-data', 'features-configs', 'insights-invalid.json'),
    validConfig: path.join('.', 'test-data', 'features-configs', 'insights-valid.json'),
    analyticsConfig: path.join('.', 'test-data', 'features-configs', 'insights-analytics-filter-off.json'),
    buildTypeConfig: path.join('.', 'test-data', 'features-configs', 'insights-build-type-filter.json'),
    electronConfig: path.join('.', 'test-data', 'features-configs', 'insights-electron.json')
};

fixture.only `Feature flag`
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
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
        // Update remote config .json
        await modifyFeaturesConfigJson(pathes.simpleRemote);
        // Clear features config table
        await deleteRowsFromTableInDB(featuresConfigTable);
        await updateControlNumber(19.2);
    })
    .after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        // Clear features config table
        await deleteRowsFromTableInDB(featuresConfigTable);
    })('Verify that default config applied when remote config version is lower', async t => {
        await t.expect(await JSON.parse(await getColumnValueFromTableInDB(featuresConfigTable, 'data')).version)
            .eql(await Common.getJsonPropertyValue('version', pathes.default), 'Config with lowest version applied');
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed when disabled in default config');
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
        // Update remote config .json
        await modifyFeaturesConfigJson(pathes.invalidConfig);
        await updateControlNumber(19.2);
    })
    .after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        // Update remote config .json
        await modifyFeaturesConfigJson(pathes.simpleRemote);
        // Clear features config table
        await deleteRowsFromTableInDB(featuresConfigTable);
    })('Verify that invaid remote config not applied even if its version is higher than in the default config', async t => {
        await t.expect(await JSON.parse(await getColumnValueFromTableInDB(featuresConfigTable, 'data')).version)
            .eql(await Common.getJsonPropertyValue('version', pathes.default), 'Config with invalid data applied');
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed when disabled in default config');
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await addNewStandaloneDatabaseApi(ossStandaloneV5Config);
        // Update remote config .json
        await modifyFeaturesConfigJson(pathes.validConfig);
        await updateControlNumber(48.2);
    })
    .after(async t => {
        await t.click(browserPage.NavigationPanel.settingsButton);
        await settingsPage.changeAnalyticsSwitcher(true);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        // Update remote config .json
        await modifyFeaturesConfigJson(pathes.simpleRemote);
        // Clear features config table
        await deleteRowsFromTableInDB(featuresConfigTable);
    })('Verify that valid remote config applied with version higher than in the default config', async t => {
        await t.expect(await JSON.parse(await getColumnValueFromTableInDB(featuresConfigTable, 'data')).version)
            .eql(await Common.getJsonPropertyValue('version', pathes.validConfig), 'Config with invalid data applied');
        // Verify that config file updated from the GitHub repository if the GitHub file has the latest timestamp
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).ok('Insights panel not displayed when enabled from remote config');

        // Verify that recommendations displayed for all databases if option enabled
        await t.click(browserPage.OverviewPanel.myRedisDbIcon);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).ok('Insights panel not displayed for the other db connection');
        await browserPage.InsightsPanel.toggleInsightsPanel(true);
        // Verify that Insights panel displayed if user's controlNumber is in range from config file
        await t.expect(browserPage.InsightsPanel.getRecommendationByName(redisVersionRecom).exists).ok('Redis Version recommendation not displayed');

        await browserPage.InsightsPanel.toggleInsightsPanel(false);
        // Verify that Insights panel can be displayed for Telemetry enabled/disabled according to filters
        await t.click(browserPage.NavigationPanel.settingsButton);
        await settingsPage.changeAnalyticsSwitcher(false);
        await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed without analytics when its filter is on');

        // Update remote config .json
        await modifyFeaturesConfigJson(pathes.analyticsConfig);
        await updateControlNumber(48.2);
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).ok('Insights panel not displayed without analytics when its filter is off');

        // Verify that Insights panel not displayed if the local config file has it disabled
        await updateControlNumber(30.1);
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed for user with control number out of the config');

        // Verify that buildType filter applied
        await modifyFeaturesConfigJson(pathes.buildTypeConfig);
        await updateControlNumber(48.2);
        await t.expect(await JSON.parse(await getColumnValueFromTableInDB(featuresConfigTable, 'data')).version)
            .eql(await Common.getJsonPropertyValue('version', pathes.buildTypeConfig), 'Config with lowest version applied');
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed when filter excludes this buildType');
    });
test
    .meta({ env: env.desktop })
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
        // Update remote config .json
        await modifyFeaturesConfigJson(pathes.validConfig);
        await updateControlNumber(48.2);
    })
    .after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        // Update remote config .json
        await modifyFeaturesConfigJson(pathes.simpleRemote);
        // Clear features config table
        await deleteRowsFromTableInDB(featuresConfigTable);
    })('Verify that Insights panel can be displayed for Electron app according to filters', async t => {
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).notOk('Insights panel displayed when filter excludes this buildType');
        // Update remote config .json
        await modifyFeaturesConfigJson(pathes.electronConfig);
        await updateControlNumber(48.2);
        await t.expect(browserPage.InsightsPanel.insightsBtn.exists).ok('Insights panel not displayed when filter includes this buildType');
    });
