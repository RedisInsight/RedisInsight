// import {ClientFunction} from 'testcafe';
import {rte, env} from '../../../helpers/constants';
import { DatabaseHelper } from '../../../helpers/database';
import {MyRedisDatabasePage} from '../../../pageObjects';
import {commonUrl, ossStandaloneConfig} from '../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
// const getPageUrl = ClientFunction(() => window.location.href);

fixture `Github functionality`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        // Reload Page
        await myRedisDatabasePage.reloadPage();
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .meta({ rte: rte.standalone, env: env.web })('Verify that user can work with Github link in the application', async t => {
        // Verify that user can see the icon for GitHub reference at the bottom of the left side bar in the List of DBs
        await t.expect(myRedisDatabasePage.NavigationPanel.githubButton.visible).ok('Github button not found');
        //Verify that user can see the icon for GitHub reference at the bottom of the left side bar on the Browser page
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.expect(myRedisDatabasePage.NavigationPanel.githubButton.visible).ok('Github button not found');
        // Verify that user can see the icon for GitHub reference at the bottom of the left side bar on the Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
        await t.expect(myRedisDatabasePage.NavigationPanel.githubButton.visible).ok('Github button');
        // update after resolving testcafe Native Automation mode limitations
        // // Verify that when user clicks on Github icon he redirects to the URL: https://github.com/RedisInsight/RedisInsight
        // await t.click(myRedisDatabasePage.NavigationPanel.githubButton);
        // await t.expect(getPageUrl()).contains('https://github.com/RedisInsight/RedisInsight', 'Link is not correct');
        // await t.switchToParentWindow();
    });
