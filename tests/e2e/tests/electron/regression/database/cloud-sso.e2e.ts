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

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let urlToUse = '';
const pathes = {
    defaultRemote: path.join('.', 'test-data', 'features-configs', 'insights-default-remote.json'),
    electronConfig: path.join('.', 'test-data', 'features-configs', 'sso-electron-build.json')
};

fixture `Cloud SSO`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseHelper.acceptLicenseTerms();
        // Update remote config .json to config with buildType filter including current app build
        await modifyFeaturesConfigJson(pathes.electronConfig);
        await updateControlNumber(48.2);
    })
    .afterEach(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
    });
test('Verify that user can see SSO feature if it is enabled in feature config', async t => {
    await t.expect(myRedisDatabasePage.NavigationHeader.cloudSignInButton.exists).ok('Cloud Sign in button not displayed when SSO feature enabled');

    // TODO fix once Sign in modal will be available to testcafe https://redislabs.atlassian.net/browse/RI-6048
    // Open Cloud Sign in dialog
    // await t.click(myRedisDatabasePage.promoButton);
    // Verify that Cloud Sign in dialog has authorization buttons for Electron app
    // await t.expect(myRedisDatabasePage.AuthorizationDialog.authDialog.exists).ok('Cloud Sigh in modal not opened');
    // await t.expect(myRedisDatabasePage.AuthorizationDialog.googleAuth.exists).ok('Google auth button not displayed in Sigh in modal');
    // await t.expect(myRedisDatabasePage.AuthorizationDialog.gitHubAuth.exists).ok('Github auth button not displayed in Sigh in modal');
    // await t.expect(myRedisDatabasePage.AuthorizationDialog.ssoAuth.exists).ok('SSO auth button not displayed in Sigh in modal');
    // await t.click(myRedisDatabasePage.Modal.closeModalButton);

    await t.click(myRedisDatabasePage.AddRedisDatabase.addDatabaseButton);
    await t.click(myRedisDatabasePage.AddRedisDatabase.addAutoDiscoverDatabase);
    // Verify that RE Cloud auto-discovery options Use Cloud Account and Use Cloud API Keys are displayed on Welcome screen
    await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudAccount.exists).ok('Use Cloud Account accordion not displayed when SSO feature enabled');
    await t.expect(myRedisDatabasePage.AddRedisDatabase.useCloudKeys.exists).ok('Use Cloud Keys accordion not displayed when SSO feature enabled');
    await t.click(myRedisDatabasePage.AddRedisDatabase.useCloudAccount);
    // Verify that Auth buttons are displayed for auto-discovery panel on Electron app
    await t.expect(myRedisDatabasePage.googleAuth.exists).ok('Google auth button not displayed when SSO feature enabled');
    await t.expect(myRedisDatabasePage.gitHubAuth.exists).ok('Github auth button not displayed when SSO feature enabled');
    await t.expect(myRedisDatabasePage.ssoAuth.exists).ok('SSO auth button not displayed when SSO feature enabled');
});
// skip until adding linux support
test.skip('Verify that user can sign in using SSO via Google authorization', async t => {
    const logsFilename = 'chrome_logs.txt';
    const logsFilePath = path.join('test-data', logsFilename);

    await t.expect(myRedisDatabasePage.promoButton.exists).ok('Import Cloud database button not displayed when SSO feature enabled');
    await t.click(myRedisDatabasePage.NavigationHeader.cloudSignInButton);
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
    await t.expect(myRedisDatabasePage.NavigationHeader.cloudSignInButton.exists).notOk('Sign in button still displayed', { timeout: 10000 });
    await myRedisDatabasePage.reloadPage();
    await t.expect(myRedisDatabasePage.userProfileBtn.exists).ok('User profile button not displayed');
    await t.click(myRedisDatabasePage.userProfileBtn);
    await t.expect(myRedisDatabasePage.userProfileAccountInfo.textContent).contains('ri-sso-test-1', 'User not signed in');
});
