import * as path from 'path';
import * as fs from 'fs';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { modifyFeaturesConfigJson, updateControlNumber } from '../../../../helpers/insights';
import { processGoogleSSO } from '../../../../helpers/google-authorization';
import { openChromeWithUrl, saveOpenedChromeTabUrl } from '../../../../helpers/scripts/browser-scripts';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const rdiInstancePage = new RdiInstancePage();

let urlToUse = '';
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
        // await databaseAPIRequests.deleteAllDatabasesApi();
        // await myRedisDatabasePage.reloadPage();
        // // Update remote config .json to default
        // await modifyFeaturesConfigJson(pathes.defaultRemote);
        // // Clear features config table
        // await DatabaseScripts.deleteRowsFromTableInDB({ tableName: 'features_config' });
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
test('Verify that user can sign in using SSO via Google authorization', async t => {
    const logsFilename = 'chrome_logs.txt';
    const logsFilePath = path.join('test-data', logsFilename);

    await t.expect(myRedisDatabasePage.promoButton.exists).ok('Import Cloud database button not displayed when SSO feature enabled');
    await t.click(rdiInstancePage.RdiHeader.cloudSignInButton);
    // Navigate to Google Auth button
    await t.pressKey('tab');
    await t.pressKey('tab');
    await t.pressKey('space');
    await t.pressKey('shift+tab');
    await t.pressKey('shift+tab');

    // Open Chrome with a sample URL and save it to logs file
    openChromeWithUrl();
    saveOpenedChromeTabUrl(logsFilePath);
    // Click the button to trigger the Google authorization page
    await t.pressKey('enter');
    await t.wait(2000);

    urlToUse = fs.readFileSync(logsFilePath, 'utf8');
    await processGoogleSSO(urlToUse);
    await t.expect(rdiInstancePage.RdiHeader.cloudSignInButton.exists).notOk('Sign in button still displayed', { timeout: 10000 });
    await myRedisDatabasePage.reloadPage();
    await t.expect(myRedisDatabasePage.userProfileBtn.exists).ok('User profile button not displayed');
    await t.click(myRedisDatabasePage.userProfileBtn);
    await t.expect(myRedisDatabasePage.userProfileAccountInfo.textContent).contains('ri-sso-test-1', 'User not signed in');
});
