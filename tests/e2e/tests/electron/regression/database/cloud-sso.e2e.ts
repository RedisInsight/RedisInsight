import * as path from 'path';
import * as fs from 'fs';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl, samlUser } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { modifyFeaturesConfigJson, updateControlNumber } from '../../../../helpers/insights';
import { closeChrome, openChromeWindow, saveOpenedChromeTabUrl } from '../../../../helpers/scripts/browser-scripts';
import { SsoAuthorization } from '../../../../helpers';
import { AiChatBotPanel } from '../../../../pageObjects/components/chatbot/ai-chatbot-panel';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const aiChatBotPanel = new AiChatBotPanel();

let urlToUse = '';
const pathes = {
    defaultRemote: path.join('.', 'test-data', 'features-configs', 'insights-default-remote.json'),
    electronConfig: path.join('.', 'test-data', 'features-configs', 'sso-electron-build.json')
};
const logsFilename = 'chrome_logs.txt';
const logsFilePath = path.join('test-data', logsFilename);

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
        if (fs.existsSync(logsFilePath)) {
            fs.unlinkSync(logsFilePath);
            console.log(`Deleted logs file: ${logsFilePath}`);
        }
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
    await t.expect(myRedisDatabasePage.AddRedisDatabase.RedisCloudSigninPanel.googleOauth.exists).ok('Google auth button not displayed when SSO feature enabled');
    await t.expect(myRedisDatabasePage.AddRedisDatabase.RedisCloudSigninPanel.githubOauth.exists).ok('Github auth button not displayed when SSO feature enabled');
    await t.expect(myRedisDatabasePage.AddRedisDatabase.RedisCloudSigninPanel.ssoOauth.exists).ok('SSO auth button not displayed when SSO feature enabled');
});
// skip until adding tests for SSO feature
test.only('Verify that user can sign in using SSO via SAML', async t => {
    // Open Chrome with a sample URL and save it to logs file
    openChromeWindow();
    await t.wait(2000);
    await t.click(myRedisDatabasePage.NavigationHeader.copilotButton);
    await t.click(aiChatBotPanel.RedisCloudSigninPanel.oauthAgreement);
    await t.click(aiChatBotPanel.RedisCloudSigninPanel.ssoOauthButton);
    await t.typeText(aiChatBotPanel.RedisCloudSigninPanel.ssoEmailInput, samlUser, { replace: true, paste: true });

    await t.wait(2000);
    saveOpenedChromeTabUrl(logsFilePath);
    await t.click(aiChatBotPanel.RedisCloudSigninPanel.submitBtn);

    await t.wait(2000);
    urlToUse = fs.readFileSync(logsFilePath, 'utf8');
    await t.expect(urlToUse).contains('authorize?');
    closeChrome();
    await SsoAuthorization.processSSOPuppeteer(urlToUse, 'SAML');
    await t.expect(myRedisDatabasePage.NavigationHeader.cloudSignInButton.exists).notOk('Sign in button still displayed', { timeout: 10000 });
    await myRedisDatabasePage.reloadPage();
    await t.expect(myRedisDatabasePage.userProfileBtn.exists).ok('User profile button not displayed');
    await t.click(myRedisDatabasePage.userProfileBtn);
    await t.expect(myRedisDatabasePage.userProfileAccountInfo.textContent).contains('Geor', 'User not signed in');
});
// Can be run only locally for google auth
test.skip('Verify that user can sign in using SSO via Google authorization', async t => {
    await t.expect(myRedisDatabasePage.promoButton.exists).ok('Import Cloud database button not displayed when SSO feature enabled');
    // Open Chrome with a sample URL and save it to logs file
    openChromeWindow();
    await t.wait(2000);
    await t.click(myRedisDatabasePage.NavigationHeader.copilotButton);
    await t.click(aiChatBotPanel.RedisCloudSigninPanel.oauthAgreement);

    await t.wait(2000);
    saveOpenedChromeTabUrl(logsFilePath);
    // Click the button to trigger the Google authorization page
    await t.click(aiChatBotPanel.RedisCloudSigninPanel.googleOauth);

    await t.wait(2000);
    urlToUse = fs.readFileSync(logsFilePath, 'utf8');
    await t.expect(urlToUse).contains('authorize?');
    closeChrome();
    await SsoAuthorization.processSSOPuppeteer(urlToUse, 'Google');
    await t.expect(myRedisDatabasePage.NavigationHeader.cloudSignInButton.exists).notOk('Sign in button still displayed', { timeout: 10000 });
    await myRedisDatabasePage.reloadPage();
    await t.expect(myRedisDatabasePage.userProfileBtn.exists).ok('User profile button not displayed');
    await t.click(myRedisDatabasePage.userProfileBtn);
    await t.expect(myRedisDatabasePage.userProfileAccountInfo.textContent).contains('Geor', 'User not signed in');
});
// Can be run only locally for github auth
test.skip('Verify that user can sign in using SSO via Github authorization', async t => {
    // Open Chrome with a sample URL and save it to logs file
    openChromeWindow();
    await t.wait(1000);
    await t.click(myRedisDatabasePage.NavigationHeader.copilotButton);
    await t.click(aiChatBotPanel.RedisCloudSigninPanel.oauthAgreement);

    await t.wait(2000);
    saveOpenedChromeTabUrl(logsFilePath);
    // Click the button to trigger the Github authorization page
    await t.click(aiChatBotPanel.RedisCloudSigninPanel.githubOauth);

    await t.wait(2000);
    urlToUse = fs.readFileSync(logsFilePath, 'utf8');
    await t.expect(urlToUse).contains('authorize?');
    closeChrome();
    await SsoAuthorization.processSSOPuppeteer(urlToUse, 'Github');
    await t.expect(myRedisDatabasePage.NavigationHeader.cloudSignInButton.exists).notOk('Sign in button still displayed', { timeout: 10000 });
    await myRedisDatabasePage.reloadPage();
    await t.expect(myRedisDatabasePage.userProfileBtn.exists).ok('User profile button not displayed');
    await t.click(myRedisDatabasePage.userProfileBtn);
    await t.expect(myRedisDatabasePage.userProfileAccountInfo.textContent).contains('Geor', 'User not signed in');
});
