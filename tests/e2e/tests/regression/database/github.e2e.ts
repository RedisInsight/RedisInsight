import {ClientFunction} from 'testcafe';
import {rte} from '../../../helpers/constants';
import {
    acceptLicenseTerms,
    addNewStandaloneDatabase,
    deleteDatabase
} from '../../../helpers/database';
import {MyRedisDatabasePage} from '../../../pageObjects';
import {commonUrl, ossStandaloneConfig} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const getPageUrl = ClientFunction(() => window.location.href);

fixture `Github functionality`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async() => {
        // await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await acceptLicenseTerms();
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test.only
    .meta({ rte: rte.standalone })
    ('Verify that user can work with Github link in the application', async t => {
        //Verify that user can see the icon for GitHub reference at the bottom of the left side bar in the List of DBs
        await t.expect(myRedisDatabasePage.githubButton.visible).ok('Github button');
        //Verify that user can see the icon for GitHub reference at the bottom of the left side bar on the Browser page
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.expect(myRedisDatabasePage.githubButton.visible).ok('Github button');
        //Verify that user can see the icon for GitHub reference at the bottom of the left side bar on the Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
        await t.expect(myRedisDatabasePage.githubButton.visible).ok('Github button');
        //Verify that when user clicks on Github icon he redirects to the URL: https://github.com/RedisInsight/RedisInsight
        await t.click(myRedisDatabasePage.githubButton);
        await t.expect(getPageUrl()).contains('https://github.com/RedisInsight/RedisInsight');
        await t.switchToParentWindow();
    });
