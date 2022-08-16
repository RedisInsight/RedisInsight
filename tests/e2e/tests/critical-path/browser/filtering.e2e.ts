import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { keyLength, KeyTypesTexts, rte } from '../../../helpers/constants';
import { addKeysViaCli, deleteKeysViaCli, keyTypes } from '../../../helpers/keys';
import { Chance } from 'chance';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();
const chance = new Chance();
const common = new Common();

let keyName = chance.word({ length: 10 });
const keysData = keyTypes.map(object => ({ ...object }));
keysData.forEach(key => key.keyName = `${key.keyName}` + '-' + `${common.generateWord(keyLength)}`);

fixture `Filtering per key name in Browser page`
    .meta({type: 'critical_path', rte: rte.standalone})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
test
    .after(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
    ('Verify that user can search a key with selected data type is filters', async t => {
        keyName = chance.word({ length: 10 });
        //Add new key
        await browserPage.addStringKey(keyName);
        //Search by key with full name & specified type
        await browserPage.selectFilterGroupType(KeyTypesTexts.String)
        await browserPage.searchByKeyName(keyName);
        //Verify that key was found
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('The key was found');
    });
test
    .after(async () => {
        // Clear keys and database
        await deleteKeysViaCli(keysData);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
    ('Verify that user can filter keys per data type in Browser page', async t => {
        keyName = chance.word({ length: 10 });
        //Create new keys
        await addKeysViaCli(keysData);
        for (const { textType, keyName } of keysData) {
            await browserPage.selectFilterGroupType(textType);
            await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok(`The key of type ${textType} was found`);
        }
    });
test
    .before(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async () => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })
    ('Verify that user see the key type label when filtering per key types and when removes lable the filter is removed on Browser page', async t => {        //Check filtering labes
        for (const { textType } of keyTypes) {
            await browserPage.selectFilterGroupType(textType);
            //Check key type label
            await t.expect((await browserPage.filteringLabel.textContent).toUpperCase).eql(textType.toUpperCase, `The label of type ${textType} is dispalyed`);
            await t.expect(browserPage.keysNumberOfResults.visible).ok(`The filter ${textType} is applied`);
        }
         //Check removing of the label
         await t.click(browserPage.deleteFilterButton);
         await t.expect(browserPage.multiSearchArea.find(browserPage.cssFilteringLabel).visible).notOk(`The label of filtering type is removed`);
         await t.expect(browserPage.keysSummary.textContent).contains('Total', `The filter is removed`);
    });
test
    ('Verify that user can see filtering per key name starts when he press Enter or clicks the control to filter per key name', async t => {        //Check filtering labes
        keyName = chance.word({ length: 10 });
        await t.expect(browserPage.keyListTable.textContent).contains('No keys to display.', 'The filtering is not set');
        //Check the filtering starts by press Enter
        await t.typeText(browserPage.filterByPatterSearchInput, keyName);
        await t.pressKey('enter');
        await t.expect(browserPage.searchAdvices.visible).ok('The filtering is set');
        //Check the filtering starts by clicks the control
        await t.eval(() => location.reload());
        await t.typeText(browserPage.filterByPatterSearchInput, keyName);
        await t.click(browserPage.searchButton);
        await t.expect(browserPage.searchAdvices.visible).ok('The filtering is set');
    });
