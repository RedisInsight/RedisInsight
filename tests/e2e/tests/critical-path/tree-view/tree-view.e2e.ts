import { Chance } from 'chance';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig
} from '../../../helpers/conf';
import { rte, KeyTypesTexts } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const chance = new Chance();

const keyNameFilter = `keyName${chance.word({ length: 10 })}`;

fixture `Tree view verifications`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .afterEach(async() => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    });
test
    .meta({ rte: rte.standalone })('Verify that when user opens the application he can see that Tree View is disabled by default(Browser is selected by default)', async t => {
        //Verify that Browser view is selected by default and Tree view is disabled
        await t.expect(browserPage.browserViewButton.getStyleProperty('background-color')).eql('rgb(41, 47, 71)', 'The Browser is selected by default');
        await t.expect(browserPage.treeViewArea.visible).notOk('The tree view is not displayed', { timeout: 10000 });
    });
test
    .meta({ rte: rte.standalone })('Verify that user can see that "Tree view" mode is enabled state is saved when refreshes the page', async t => {
        await t.click(browserPage.treeViewButton);
        await t.eval(() => location.reload());
        //Verify that "Tree view" mode enabled state is saved
        await t.expect(browserPage.treeViewArea.visible).ok('The tree view is displayed');
    });
test
    .meta({ rte: rte.standalone })('Verify that user can scan DB by 10K in tree view', async t => {
        await t.click(browserPage.treeViewButton);
        //Verify that user can use the "Scan More" button to search per another 10000 keys
        for (let i = 10; i < 100; i += 10) {
            // scannedValue = scannedValue + 10;
            await t.expect(browserPage.progressKeyList.exists).notOk('Progress Bar is not displayed', { timeout: 30000 });
            const scannedValueText = await browserPage.scannedValue.textContent;
            const regExp = new RegExp(`${i} 00` + '.');
            await t.expect(scannedValueText).match(regExp, `The database is automatically scanned by ${i} 000 keys`);
            await t.doubleClick(browserPage.scanMoreButton);
            await t.expect(browserPage.progressKeyList.exists).ok('Progress Bar is displayed', { timeout: 30000 });
        }
    });
test
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyNameFilter);
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })
    .meta({ rte: rte.standalone })('Verify that when user enables filtering by key name he can see only folder with appropriate keys are displayed and the number of keys and percentage is recalculated', async t => {
        await browserPage.addHashKey(keyNameFilter);
        await t.click(browserPage.treeViewButton);
        const numberOfKeys = await browserPage.treeViewKeysNumber.textContent;
        const percentage = await browserPage.treeViewPercentage.textContent;
        //Set filter by key name
        await browserPage.searchByKeyName(keyNameFilter);
        await t.expect(browserPage.treeViewKeysItem.visible).ok('The key appears after the filtering', { timeout: 10000 });
        await t.click(browserPage.treeViewKeysItem);
        //Verify the results
        await t.expect(browserPage.treeViewKeysNumber.textContent).notEql(numberOfKeys, 'The number of keys is recalculated');
        await t.expect(browserPage.treeViewPercentage.textContent).notEql(percentage, 'The percentage is recalculated');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyNameFilter)).ok('The appropriate keys are displayed');
    });
test
    .meta({ rte: rte.standalone })('Verify that when user switched from Tree View to Browser and goes back state of filer by key name/key type is saved', async t => {
        const keyName = 'user*';
        await t.click(browserPage.treeViewButton);
        await browserPage.searchByKeyName(keyName);
        await t.click(browserPage.browserViewButton);
        await t.click(browserPage.treeViewButton);
        //Verify that state of filer by key name is saved
        await t.expect(await browserPage.filterByPatterSearchInput.withAttribute('value', keyName).exists).ok('Filter per key name is still applied');
        await t.click(browserPage.treeViewButton);
        //Set filter by key type
        await browserPage.selectFilterGroupType(KeyTypesTexts.String);
        await t.click(browserPage.browserViewButton);
        await t.click(browserPage.treeViewButton);
        //Verify that state of filer by key type is saved
        await t.expect(await browserPage.selectedFilterTypeString.visible).eql(true, 'Filter per key type is still applied');
    });
