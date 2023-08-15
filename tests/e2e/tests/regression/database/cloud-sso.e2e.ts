import * as path from 'path';
import { BrowserPage, MyRedisDatabasePage, SettingsPage, WelcomePage } from '../../../pageObjects';
import { RecommendationIds, rte, env } from '../../../helpers/constants';
import { DatabaseHelper } from '../../../helpers/database';
import { commonUrl, ossStandaloneConfig, ossStandaloneV5Config } from '../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { deleteRowsFromTableInDB, getColumnValueFromTableInDB } from '../../../helpers/database-scripts';
import { modifyFeaturesConfigJson, refreshFeaturesTestData, updateControlNumber } from '../../../helpers/insights';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const settingsPage = new SettingsPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const welcomePage = new WelcomePage();

const featuresConfigTable = 'features_config';
const pathes = {
    defaultRemote: path.join('.', 'test-data', 'features-configs', 'insights-default-remote.json'),
    dockerConfig: path.join('.', 'test-data', 'features-configs', 'sso-docker-build.json'),
    electronConfig: path.join('.', 'test-data', 'features-configs', 'sso-electron-build.json')
};

fixture `Cloud SSO`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseHelper.acceptLicenseTerms();
        // await myRedisDatabasePage.reloadPage();
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteAllDatabasesApi();
        await myRedisDatabasePage.reloadPage();
        // Update remote config .json to default
        await modifyFeaturesConfigJson(pathes.defaultRemote);
        // Clear features config table
        await deleteRowsFromTableInDB(featuresConfigTable);
    });
test
    .meta({ env: env.web })
    .before(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseHelper.acceptLicenseTerms();
        
        // await myRedisDatabasePage.reloadPage();
    })
    .after(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await myRedisDatabasePage.reloadPage();
        // Update remote config .json to default
        await modifyFeaturesConfigJson(pathes.defaultRemote);
        // Clear features config table
        await deleteRowsFromTableInDB(featuresConfigTable);
    })('Verify that user can not see the import Cloud databases on the Welcome screen for docker build', async t => {
        // Update remote config .json to config with buildType filter excluding current app build
        await modifyFeaturesConfigJson(pathes.dockerConfig);
        await updateControlNumber(48.2);
        await t.expect(welcomePage.importCloudDbBtn.exists).notOk('Import Cloud database button displayed for docker build');

        // Verify that user can not see the import Cloud databases on the Auto-discovery flow for docker build
        await t.click(welcomePage.addDbAutoBtn);
        await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudAccount.exists).notOk('Use Cloud Account accordion displayed for docker build');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudKeys.exists).notOk('Use Cloud Keys accordion displayed for docker build');
    });