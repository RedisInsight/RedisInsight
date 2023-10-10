import * as path from 'path';
import { MyRedisDatabasePage, WelcomePage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { modifyFeaturesConfigJson, refreshFeaturesTestData, updateControlNumber } from '../../../../helpers/insights';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const welcomePage = new WelcomePage();

const pathes = {
    dockerConfig: path.join('.', 'test-data', 'features-configs', 'sso-docker-build.json')
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
test('Verify that user can not see the import Cloud databases on the Welcome screen for docker build', async t => {
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
