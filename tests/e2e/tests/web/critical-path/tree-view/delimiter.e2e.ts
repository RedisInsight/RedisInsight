import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneBigConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { BrowserActions } from '../../../../common-actions/browser-actions';

const browserPage = new BrowserPage();
const browserActions = new BrowserActions();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture `Delimiter tests`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    })
    .afterEach(async() => {
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    });
test('Verify that user can see that input is not saved when the Cancel button is clicked', async t => {
    // Switch to tree view
    await t.click(browserPage.treeViewButton);
    await t.click(browserPage.TreeView.treeViewSettingsBtn);
    // Check the default delimiter value
    await t.expect(browserPage.TreeView.treeViewDelimiterInput.value).eql(':', 'Default delimiter not applied');
    // Apply new value to the field
    await t.typeText(browserPage.TreeView.treeViewDelimiterInput, 'test', { replace: true });
    // Click on Cancel button
    await t.click(browserPage.TreeView.treeViewDelimiterValueCancel);
    // Check the previous delimiter value
    await t.click(browserPage.TreeView.treeViewSettingsBtn);
    await t.expect(browserPage.TreeView.treeViewDelimiterInput.value).eql(':', 'Previous delimiter not applied');
    await t.click(browserPage.TreeView.treeViewDelimiterValueCancel);

    // Change delimiter
    await browserPage.TreeView.changeDelimiterInTreeView('-');
    // Verify that when user changes the delimiter and clicks on Save button delimiter is applied
    await browserActions.checkTreeViewFoldersStructure([['device_us', 'west'], ['mobile_eu', 'central'], ['mobile_us', 'east'], ['user_us', 'west'], ['device_eu', 'central'], ['user_eu', 'central']], '-');
});
