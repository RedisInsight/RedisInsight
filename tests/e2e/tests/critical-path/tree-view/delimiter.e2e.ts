import {acceptLicenseTermsAndAddDatabase, deleteDatabase} from '../../../helpers/database';
import {
    BrowserPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig
} from '../../../helpers/conf';
import {rte} from '../../../helpers/constants';

const browserPage = new BrowserPage();

fixture `Delimiter tests`
    .meta({
        type: 'critical_path',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .afterEach(async() => {
        await deleteDatabase(ossStandaloneBigConfig.databaseName);
    })
test('Verify that when user changes the delimiter and clicks on Save button delimiter is applied', async t => {
    // Switch to tree view
    await t.click(browserPage.treeViewButton);
    // Check that keys are displayed according to the selected delimiter
    await browserPage.checkTreeViewFoldersStructure([['mobile', '739'], ['device', '2330'], ['user', '91']], ':', true);
    // Open delimiter popup
    await t.click(browserPage.treeViewDelimiterButton);
    // Check the previous value
    await t.expect(browserPage.treeViewDelimiterButton.withExactText(':').exists).ok('Default delimiter value');
    // Apply new value to the field
    await t.typeText(browserPage.treeViewDelimiterInput, '-', { replace: true });
    // Click on save button
    await t.click(browserPage.treeViewDelimiterValueSave);
    // Check tree view according to the applied delimiter
    await browserPage.checkTreeViewFoldersStructure([['device_us', 'west'], ['mobile_eu', 'central'], ['mobile_us', 'east'], ['user_us', 'west'], ['device_eu', 'central'], ['user_eu', 'central']], '-', true);
});
test('Verify that user can see that input is not saved when the Cancel button is clicked', async t => {
    // Switch to tree view
    await t.click(browserPage.treeViewButton);
    // Check the default delimiter value
    await t.expect(browserPage.treeViewDelimiterButton.withExactText(':').exists).ok('Default delimiter');
    // Open delimiter popup
    await t.click(browserPage.treeViewDelimiterButton);
    // Apply new value to the field
    await t.typeText(browserPage.treeViewDelimiterInput, 'test', { replace: true });
    // Click on Cancel button
    await t.click(browserPage.treeViewDelimiterValueCancel);
    // Check the previous delimiter value
    await t.expect(browserPage.treeViewDelimiterButton.withExactText(':').exists).ok('Previous delimiter');
});
