import { BrowserPage, WorkbenchPage } from '../../../../pageObjects';
import { ExploreTabs, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const workbenchPage = new WorkbenchPage();

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
    await browserPage.InsightsPanel.setActiveTab(ExploreTabs.Recommendations);
    await browserPage.InsightsPanel.togglePanel(false);
    await t.click(browserPage.NavigationPanel.workbenchButton);
    await t.click(workbenchPage.exploreRedisBtn);
    await t.expect(await browserPage.InsightsPanel.getActiveTabName()).eql(ExploreTabs.Explore);
});
