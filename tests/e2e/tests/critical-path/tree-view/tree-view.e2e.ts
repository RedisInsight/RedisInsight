import { DatabaseHelper } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneBigConfig } from '../../../helpers/conf';
import { rte, KeyTypesTexts } from '../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { verifySearchFilterValue } from '../../../helpers/keys';
import { APIKeyRequests } from '../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

const keyNameFilter = `keyName${Common.generateWord(10)}`;

fixture `Tree view verifications`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    });
test('Verify that user can see that "Tree view" mode is enabled state is saved when refreshes the page', async t => {
    // Verify that when user opens the application he can see that Tree View is disabled by default(Browser is selected by default)
    await t.expect(browserPage.browserViewButton.getStyleProperty('background-color')).eql('rgb(41, 47, 71)', 'The Browser is not selected by default');
    await t.expect(browserPage.treeViewArea.exists).notOk('The tree view is displayed', { timeout: 10000 });

    await t.click(browserPage.treeViewButton);
    await browserPage.reloadPage();
    // Verify that "Tree view" mode enabled state is saved
    await t.expect(browserPage.treeViewArea.exists).ok('The tree view is not displayed');

    // Verify that user can scan DB by 10K in tree view
    await browserPage.verifyScannningMore();
});
test
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyNameFilter, ossStandaloneBigConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Verify that when user enables filtering by key name he can see only folder with appropriate keys are displayed and the number of keys and percentage is recalculated', async t => {
        await browserPage.addHashKey(keyNameFilter);
        await t.click(browserPage.treeViewButton);
        const numberOfKeys = await browserPage.treeViewKeysNumber.textContent;
        const percentage = await browserPage.treeViewPercentage.textContent;
        // Set filter by key name
        await browserPage.searchByKeyName(keyNameFilter);
        await t.expect(browserPage.treeViewKeysItem.exists).ok('The key not appeared after the filtering', { timeout: 10000 });
        await t.click(browserPage.treeViewKeysItem);
        // Verify the results
        await t.expect(browserPage.treeViewKeysNumber.textContent).notEql(numberOfKeys, 'The number of keys is not recalculated');
        await t.expect(browserPage.treeViewPercentage.textContent).notEql(percentage, 'The percentage is not recalculated');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyNameFilter)).ok('The appropriate keys are not displayed');
    });
test('Verify that when user switched from Tree View to Browser and goes back state of filer by key name/key type is saved', async t => {
    const keyName = 'user*';
    await t.click(browserPage.treeViewButton);
    await browserPage.searchByKeyName(keyName);
    await t.click(browserPage.browserViewButton);
    await t.click(browserPage.treeViewButton);
    // Verify that state of filer by key name is saved
    await verifySearchFilterValue(keyName);
    await t.click(browserPage.treeViewButton);
    // Set filter by key type
    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    await t.click(browserPage.browserViewButton);
    await t.click(browserPage.treeViewButton);
    // Verify that state of filer by key type is saved
    await t.expect(browserPage.filterByKeyTypeDropDown.innerText).eql(KeyTypesTexts.String, 'Filter per key type is not applied');
});
