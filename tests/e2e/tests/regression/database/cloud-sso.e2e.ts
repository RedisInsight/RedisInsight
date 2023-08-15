import * as path from 'path';
import { MyRedisDatabasePage, WelcomePage } from '../../../pageObjects';
import { rte, env } from '../../../helpers/constants';
import { DatabaseHelper } from '../../../helpers/database';
import { commonUrl } from '../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { deleteRowsFromTableInDB } from '../../../helpers/database-scripts';
import { modifyFeaturesConfigJson, refreshFeaturesTestData, updateControlNumber } from '../../../helpers/insights';

const myRedisDatabasePage = new MyRedisDatabasePage();
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
        await refreshFeaturesTestData();
        await databaseHelper.acceptLicenseTerms();
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteAllDatabasesApi();
        await refreshFeaturesTestData();
    });
test
    .meta({ env: env.web })
    .before(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await refreshFeaturesTestData();
        await databaseHelper.acceptLicenseTerms();
    })
    .after(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await refreshFeaturesTestData();
    })('Verify that user can not see the import Cloud databases on the Welcome screen for docker build', async t => {
        // Update remote config .json to config with buildType filter excluding current app build
        await modifyFeaturesConfigJson(pathes.dockerConfig);
        await updateControlNumber(48.2);
        await t.expect(welcomePage.importCloudDbBtn.exists).notOk('Import Cloud database button displayed for docker build');

        // Verify that user can not see the import Cloud databases on the Auto-discovery flow for docker build
        await t.click(welcomePage.addDbAutoBtn);
        // Verify that when SSO flag disabled - Use Cloud API Keys displayed not as dropdown
        await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudAccount.exists).notOk('Use Cloud Account accordion displayed for docker build');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudKeys.exists).notOk('Use Cloud Keys accordion displayed for docker build');
    });
test
    .meta({ env: env.desktop })
    .before(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseHelper.acceptLicenseTerms();
    })
    .after(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await myRedisDatabasePage.reloadPage();
        // Update remote config .json to default
        await modifyFeaturesConfigJson(pathes.defaultRemote);
        // Clear features config table
        await deleteRowsFromTableInDB(featuresConfigTable);
    })('Verify that user can see SSO feature if it is enabled in feature config', async t => {
        // Update remote config .json to config with buildType filter excluding current app build
        await modifyFeaturesConfigJson(pathes.dockerConfig);
        await updateControlNumber(48.2);
        // Verify that user can't see SSO feature if it is disabled in feature config
        await t.expect(welcomePage.importCloudDbBtn.exists).notOk('Import Cloud database button displayed when SSO feature disabled');

        // Update remote config .json to config with buildType filter including current app build
        await modifyFeaturesConfigJson(pathes.electronConfig);
        await updateControlNumber(48.2);
        await t.expect(welcomePage.importCloudDbBtn.exists).ok('Import Cloud database button not displayed when SSO feature enabled');

        await t.click(welcomePage.addDbAutoBtn);
        // Verify that RE Cloud auto-discovery options Use Cloud Account and Use Cloud API Keys are displayed on Welcome screen
        await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudAccount.exists).ok('Use Cloud Account accordion not displayed when SSO feature enabled');
        await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudKeys.exists).ok('Use Cloud Keys accordion not displayed when SSO feature enabled');
    });
