import { Chance } from 'chance';
import { Selector } from 'testcafe';
import { KeyTypesTexts, rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossStandaloneBigConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { keyTypes } from '../../../helpers/keys';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 20 });
let keyName2 = chance.word({ length: 20 });
const COMMAND_GROUP_SET = 'Set';

fixture `Filtering per key name in Browser page`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that when user searches not existed key, he can see the standard screen when there are no keys found', async t => {
    keyName = chance.word({ length: 20 });
    //Add new key
    await browserPage.addStringKey(keyName);
    //Search not existed key
    const searchedKeyName = 'key00000qwertyuiop[asdfghjkl';
    await browserPage.searchByKeyName(searchedKeyName);
    //Verify the standard screen when there are no keys found
    const noResultsFound = await browserPage.noResultsFound.textContent;
    const searchAdvices = await browserPage.searchAdvices.textContent;
    await t.expect(noResultsFound).eql('No results found.', 'The no results text');
    await t.expect(searchAdvices).eql('Check the spelling.Check upper and lower cases.Use an asterisk (*) in your request for more generic results.', 'The advices text');
});
test('Verify that user can filter per pattern with * (matches keys with any number of characters instead of *)', async t => {
    keyName = `KeyForSearch*${chance.word({ length: 10 })}?[]789`;
    //Add new key
    await browserPage.addStringKey(keyName);
    //Filter per pattern with *
    const searchedValue = 'KeyForSear*';
    await browserPage.searchByKeyName(searchedValue);
    //Verify that key was found
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was found');
});
test('Verify that user can filter per pattern with ? (matches keys with any character (only one) instead of ?)', async t => {
    const randomValue = chance.word({ length: 10 });
    keyName = `KeyForSearch*?[]789${randomValue}`;
    //Add new key
    await browserPage.addStringKey(keyName);
    //Filter per pattern with ?
    const searchedValue = `?eyForSearch\\*\\?\\[]789${randomValue}`;
    await browserPage.searchByKeyName(searchedValue);
    //Verify that key was found
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was found');
});
test
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await browserPage.deleteKeyByName(keyName2);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can filter per pattern with [xy] (matches one symbol: either x or y))', async t => {
        keyName = `KeyForSearch${chance.word({ length: 10 })}`;
        keyName2 = `KeyForFearch${chance.word({ length: 10 })}`;
        //Add keys
        await browserPage.addStringKey(keyName);
        await browserPage.addHashKey(keyName2);
        //Filter per pattern with [XY]
        const searchedValue = 'KeyFor[SF]*';
        await browserPage.searchByKeyName(searchedValue);
        //Verify that key was found
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was found');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName2)).ok('The key was found');
    });
test
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await browserPage.deleteKeyByName(keyName2);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can filter per pattern with [^x] (matches one symbol except x)', async t => {
        const randomValue = chance.word({ length: 5 });
        keyName = `KeyForSearch${randomValue}`;
        keyName2 = `KeyForFearch${randomValue}`;
        //Add keys
        await browserPage.addStringKey(keyName);
        await browserPage.addHashKey(keyName2);
        //Filter per pattern with [^x]
        const searchedValue = 'KeyFor[^F]*';
        await browserPage.searchByKeyName(searchedValue);
        //Verify that key was found
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was found');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName2)).notOk('The key wasn\'t found');
    });
test
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await browserPage.deleteKeyByName(keyName2);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can filter per pattern with [a-z] (matches any symbol in range from A till Z)', async t => {
        keyName = `KeyForSearch${chance.word({ length: 10 })}`;
        keyName2 = `KeyForFearch${chance.word({ length: 10 })}`;
        //Add keys
        await browserPage.addStringKey(keyName);
        await browserPage.addHashKey(keyName2);
        //Filter per pattern with [a-z]
        const searchedValue = 'KeyFor[A-G]*';
        await browserPage.searchByKeyName(searchedValue);
        //Verify that key was found
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName2)).ok('The key was found');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).notOk('The key wasn\'t found');
    });
test
    .after(async() => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that when user clicks on “clear” control with no filter per key name applied all characters and filter per key type are removed, “clear” control is disappeared', async t => {
        keyName = `KeyForSearch${chance.word({ length: 10 })}`;
        //Set filter by key type and type characters
        await t.typeText(browserPage.filterByPatterSearchInput, keyName);
        await browserPage.selectFilterGroupType(COMMAND_GROUP_SET);
        //Verify the clear control
        await t.click(browserPage.clearFilterButton);
        await t.expect(browserPage.multiSearchArea.find(browserPage.cssFilteringLabel).visible).notOk('The filter per key type is removed');
        await t.expect(browserPage.filterByPatterSearchInput.getAttribute('value')).eql('', 'All characters from filter input are removed');
        await t.expect(browserPage.clearFilterButton.visible).notOk('The clear control is disappeared');
    });
test
    .after(async() => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that when user clicks on “clear” control and filter per key name is applied all characters and filter per key type are removed, “clear” control is disappeared', async t => {
        keyName = `KeyForSearch${chance.word({ length: 10 })}`;
        //Set filter by key type and filter per key name
        await browserPage.searchByKeyName(keyName);
        await browserPage.selectFilterGroupType(COMMAND_GROUP_SET);
        //Verify the clear control
        await t.click(browserPage.clearFilterButton);
        await t.expect(browserPage.multiSearchArea.find(browserPage.cssFilteringLabel).visible).notOk('The filter per key type is removed');
        await t.expect(browserPage.filterByPatterSearchInput.getAttribute('value')).eql('', 'All characters from filter input are removed');
        await t.expect(browserPage.clearFilterButton.visible).notOk('The clear control is disappeared');
    });
test
    .after(async() => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that when user clicks on “clear” control and filter per key name is applied filter is reset and rescan initiated', async t => {
        keyName = `KeyForSearch${chance.word({ length: 50 })}`;
        //Search for not existed key name
        await browserPage.searchByKeyName(keyName);
        await t.expect(browserPage.keyListTable.textContent).contains('No results found.', 'Key is not found');
        //Verify the clear control
        await t.click(browserPage.clearFilterButton);
        await t.expect(browserPage.filterByPatterSearchInput.getAttribute('value')).eql('', 'The filtering is reset');
        await t.expect(browserPage.noResultsFound.exists).notOk('No results found message is hidden');
    });
test
    .after(async() => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that when user clicks "Clear selection button" in Dropdown with key data types selected data type is reseted', async t => {
        keyName = `KeyForSearch${chance.word({ length: 10 })}`;
        //Set filter by key type and type characters
        await t.typeText(browserPage.filterByPatterSearchInput, keyName);
        await browserPage.selectFilterGroupType(COMMAND_GROUP_SET);
        //Verify the Clear selection button
        await t.click(browserPage.filterOptionTypeSelected.nth(1));
        await t.click(browserPage.clearSelectionButton);
        await t.expect(browserPage.multiSearchArea.find(browserPage.cssFilteringLabel).visible).notOk('The filter per key type is removed');
        await t.expect(browserPage.filterByPatterSearchInput.getAttribute('value')).eql(keyName, 'All characters from filter input are not removed');
    });
test
    .before(async() => {
        // Add Big standalone DB
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async() => {
        // Delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Verify that user can filter per exact key without using any patterns in DB with 10 millions of keys', async t => {
        // Create new key
        keyName = `KeyForSearch-${chance.word({ length: 10 })}`;
        await browserPage.addSetKey(keyName);
        // Search by key name
        await browserPage.searchByKeyName(keyName);
        // Verify that required key is displayed
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('Found key');
        // Switch to tree view
        await t.click(browserPage.treeViewButton);
        // Check searched key in tree view
        await t.click(browserPage.treeViewNotPatternedKeys);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('Found key');
    });
test
    .before(async () => {
        // Add Big standalone DB
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async () => {
        // Delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Verify that user can filter per key name using patterns in DB with 10-50 millions of keys', async t => {
        // Create new key
        keyName = `KeyForSearch-${chance.word({ length: 10 })}`;
        await browserPage.addSetKey(keyName);
        // Search by key name
        await browserPage.selectFilterGroupType(KeyTypesTexts.Set);
        // Verify that required key is displayed
        await browserPage.searchByKeyNameWithScanMore('KeyForSearch*', keyName);
        // Verify that required key is displayed in tree view
        await t.click(browserPage.treeViewButton);
        await browserPage.searchByKeyNameWithScanMore('KeyForSearch*', keyName);
    });
test
    .before(async() => {
        // Add Big standalone DB
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Verify that user can filter per key type in DB with 10-50 millions of keys', async t => {
        for (let i = 0; i < keyTypes.length - 3; i++) {
            await browserPage.selectFilterGroupType(keyTypes[i].textType);
            const filteredTypeKeys = Selector(`[data-testid^=badge-${keyTypes[i].keyName.slice(0, 3)}]`);
            // Verify that all results have the same type as in filter
            await t.expect(await browserPage.filteringLabel.count).eql(await filteredTypeKeys.count, `The keys of type ${keyTypes[i].textType} not filtered correctly`);
        }
    });
