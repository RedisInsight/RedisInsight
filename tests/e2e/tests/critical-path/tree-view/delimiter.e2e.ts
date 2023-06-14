import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import {
    BrowserPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();

fixture `Delimiter tests`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .afterEach(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    });
test('Verify that user can see that input is not saved when the Cancel button is clicked', async t => {
    // Switch to tree view
    await t.click(browserPage.treeViewButton);
    // Check the default delimiter value
    await t.expect(browserPage.treeViewDelimiterButton.withExactText(':').exists).ok('Default delimiter not applied');
    // Open delimiter popup
    await t.click(browserPage.treeViewDelimiterButton);
    // Apply new value to the field
    await t.typeText(browserPage.treeViewDelimiterInput, 'test', { replace: true });
    // Click on Cancel button
    await t.click(browserPage.treeViewDelimiterValueCancel);
    // Check the previous delimiter value
    await t.expect(browserPage.treeViewDelimiterButton.withExactText(':').exists).ok('Previous delimiter not applied');

    // Change delimiter
    await browserPage.changeDelimiterInTreeView('-');
    // Verify that when user changes the delimiter and clicks on Save button delimiter is applied
    await browserPage.checkTreeViewFoldersStructure([['device_us', 'west'], ['mobile_eu', 'central'], ['mobile_us', 'east'], ['user_us', 'west'], ['device_eu', 'central'], ['user_eu', 'central']], '-', true);
});
