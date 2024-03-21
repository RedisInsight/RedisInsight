import * as path from 'path';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { modifyFeaturesConfigJson, refreshFeaturesTestData, updateControlNumber } from '../../../../helpers/insights';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

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
test('Verify that user can not see the promo Cloud databases for docker build', async t => {
    //TODO should be updated when AI or sth other will be added

    // Update remote config .json to config with buildType filter excluding current app build
    // await modifyFeaturesConfigJson(pathes.dockerConfig);
    // await updateControlNumber(48.2);
    // await t.expect(myRedisDatabasePage.promoButton.textContent).notOk('Import Cloud database button displayed for docker build');

    // Verify that when SSO flag disabled - Use Cloud API Keys displayed not as dropdown
    await t.click(
        myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
    await t.click(
        myRedisDatabasePage.AddRedisDatabase.addAutoDiscoverDatabase);
    await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudAccount.exists).notOk('Use Cloud Account accordion displayed for docker build');
    await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudKeys.exists).notOk('Use Cloud Keys accordion displayed for docker build');
});
