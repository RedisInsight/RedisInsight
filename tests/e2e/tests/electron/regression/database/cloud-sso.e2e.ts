import * as path from 'path';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { DatabaseScripts } from '../../../../helpers/database-scripts';
import { modifyFeaturesConfigJson, updateControlNumber } from '../../../../helpers/insights';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

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
    })
    .afterEach(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await myRedisDatabasePage.reloadPage();
        // Update remote config .json to default
        await modifyFeaturesConfigJson(pathes.defaultRemote);
        // Clear features config table
        await DatabaseScripts.deleteRowsFromTableInDB({ tableName: 'features_config' });
    });
test('Verify that user can see SSO feature if it is enabled in feature config', async t => {
    //TODO should be updated when AI or sth other will be added

    // Update remote config .json to config with buildType filter excluding current app build
    // await modifyFeaturesConfigJson(pathes.dockerConfig);
    // await updateControlNumber(48.2);
    // // Verify that user can't see SSO feature if it is disabled in feature config
    // await t.expect(myRedisDatabasePage.promoButton.exists).notOk('promo Cloud database button displayed when SSO feature disabled');

    // Update remote config .json to config with buildType filter including current app build
    await modifyFeaturesConfigJson(pathes.electronConfig);
    await updateControlNumber(48.2);
    await t.expect(myRedisDatabasePage.promoButton.exists).ok('Import Cloud database button not displayed when SSO feature enabled');

    await t.click(
        myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
    await t.click(
        myRedisDatabasePage.AddRedisDatabase.addAutoDiscoverDatabase);
    // Verify that RE Cloud auto-discovery options Use Cloud Account and Use Cloud API Keys are displayed on Welcome screen
    await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudAccount.exists).ok('Use Cloud Account accordion not displayed when SSO feature enabled');
    await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudKeys.exists).ok('Use Cloud Keys accordion not displayed when SSO feature enabled');
});
