import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 20 });
let keyName2 = chance.word({ length: 20 });

fixture `Filtering per key name in Browser page`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that when user searches not existed key, he can see the standard screen when there are no keys found', async t => {
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can filter per pattern with * (matches keys with any number of characters instead of *)', async t => {
        keyName = `KeyForSearch*${chance.word({ length: 10 })}?[]789`;
        //Add new key
        await browserPage.addStringKey(keyName);
        //Filter per pattern with *
        const searchedValue = 'KeyForSear*';
        await browserPage.searchByKeyName(searchedValue);
        //Verify that key was found
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was found');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can filter per pattern with ? (matches keys with any character (only one) instead of ?)', async t => {
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
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await browserPage.deleteKeyByName(keyName2);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can filter per pattern with [xy] (matches one symbol: either x or y))', async t => {
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
    .meta({ rte: rte.standalone })    
    .after(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await browserPage.deleteKeyByName(keyName2);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can filter per pattern with [^x] (matches one symbol except x)', async t => {
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
    .meta({ rte: rte.standalone })    
    .after(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await browserPage.deleteKeyByName(keyName2);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can filter per pattern with [a-z] (matches any symbol in range from A till Z)', async t => {
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
