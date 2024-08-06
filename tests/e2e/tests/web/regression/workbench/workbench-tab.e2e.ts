import { ExploreTabs, KeysInteractionTabs, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const browserPage = new BrowserPage();

fixture `Autocomplete for entered commands`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that tutorials can be opened from Workbench', async t => {
    const workbench =  await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.Workbench);
    await t.click(workbench.getTutorialLinkLocator('redis_use_cases_basic'));
    await t.expect(workbench.InsightsPanel.sidePanel.exists).ok('Insight panel is not opened');
    const tab = await browserPage.InsightsPanel.setActiveTab(ExploreTabs.Tutorials);
    await t.expect(tab.preselectArea.textContent).contains('BASIC REDIS USE CASES', 'the tutorial page is incorrect');
});
