import { BrowserPage, MyRedisDatabasePage, WorkbenchPage } from '../../../../pageObjects';
import { ExploreTabs, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import {
    commonUrl,
    ossStandaloneConfig,
    ossStandaloneV5Config
} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const workbenchPage = new WorkbenchPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture `Open insights panel`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify Explore redis tab is opened from empty screens', async t => {
    await t.click(browserPage.openTutorialsBtn);
    await t.expect(browserPage.InsightsPanel.sidePanel.exists).ok('the panel is opened');
    await t.expect(await browserPage.InsightsPanel.getActiveTabName()).eql(ExploreTabs.Explore);
    await browserPage.InsightsPanel.setActiveTab(ExploreTabs.Tips);
    await browserPage.InsightsPanel.togglePanel(false);
    await t.click(browserPage.NavigationPanel.workbenchButton);
    await t.click(workbenchPage.exploreRedisBtn);
    await t.expect(await browserPage.InsightsPanel.getActiveTabName()).eql(ExploreTabs.Explore);
});
test
    .before(async t => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneV5Config);
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig, true);
        await browserPage.reloadPage();

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);

    })
    .after(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
    })('Verify that insights panel is opened in cloud db if users db does not have some module', async t => {
        await t.click(browserPage.redisearchModeBtn);
        await t.click(browserPage.closeDialogButton);
        await t.click(browserPage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.expect(browserPage.InsightsPanel.sidePanel.exists).ok('the panel is opened');
        await t.expect(await browserPage.InsightsPanel.existsCompatibilityPopover.textContent).contains('Search and Query capability', 'popover is not displayed');
        const tab = await browserPage.InsightsPanel.setActiveTab(ExploreTabs.Explore);
        await t.expect(tab.preselectArea.textContent).contains('VECTOR SIMILARITY SEARCH', 'the tutorial is incorrect');

        await t.click(browserPage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
        await t.click(browserPage.NavigationPanel.workbenchButton);
        await workbenchPage.sendCommandInWorkbench('TS.');

        await t.click(browserPage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.expect(browserPage.InsightsPanel.sidePanel.exists).ok('the panel is opened');
        await t.expect(await browserPage.InsightsPanel.existsCompatibilityPopover.textContent).contains('time series', 'popover is not displayed');
        await t.expect(tab.preselectArea.textContent).contains('REDIS FOR TIME SERIES', 'the tutorial is incorrect');
    });
