import { DatabaseHelper } from '../../../../helpers';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { BrowserPage } from '../../../../pageObjects';
import { ExploreTabs, KeysInteractionTabs, rte } from '../../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';

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
    const search =  await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);
    await t.click(search.getTutorialLinkLocator('sq-exact-match'));
    await t.expect(search.InsightsPanel.sidePanel.exists).ok('Insight panel is not opened');
    const tab = await browserPage.InsightsPanel.setActiveTab(ExploreTabs.Tutorials);
    await t.expect(tab.preselectArea.textContent).contains('EXACT MATCH', 'the tutorial page is incorrect');
});
