import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const chance = new Chance();

let keyName = `KeyForSearch*?[]789${chance.word({ length: 10 })}`;
let keyName2 = chance.word({ length: 10 });
let randomValue = chance.word({ length: 10 });
const valueWithEscapedSymbols = 'KeyFor[A-G]*(';
const searchedKeyName = 'KeyForSearch\\*\\?\\[]789';
const searchedValueWithEscapedSymbols = 'KeyFor\\[A-G\\]\\*\\(';

fixture `Filtering per key name in Browser page`
    .meta({type: 'smoke'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(`${searchedKeyName}${randomValue}`);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can search per full key name', async t => {
    randomValue = chance.word({ length: 10 });
    keyName = `KeyForSearch*?[]789${randomValue}`;
    //Add new key
    await browserPage.addStringKey(keyName);
    //Search by key with full name
    await browserPage.searchByKeyName(`${searchedKeyName}${randomValue}`);
    //Verify that key was found
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key was found');
});
test('Verify that user can filter per exact key without using any patterns', async t => {
    randomValue = chance.word({ length: 10 });
    keyName = `KeyForSearch*?[]789${randomValue}`;
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Create new key for search
    await t.typeText(cliPage.cliCommandInput, `APPEND ${keyName} 1`);
    await t.pressKey('enter');
    await t.click(cliPage.cliCollapseButton);
    //Filter per exact key without using any patterns
    await browserPage.searchByKeyName(`${searchedKeyName}${randomValue}`);
    //Verify that key was found
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was found');
});
test
    .after(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await browserPage.deleteKeyByName(keyName2);
        await browserPage.deleteKeyByName(searchedValueWithEscapedSymbols);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can filter per combined pattern with ?, *, [xy], [^x], [a-z] and escaped special symbols', async t => {
        keyName = `KeyForSearch${chance.word({ length: 10 })}`;
        keyName2 = `KeyForSomething${chance.word({ length: 10 })}`;
        //Add keys
        await browserPage.addStringKey(keyName);
        await browserPage.addHashKey(keyName2);
        await browserPage.addHashKey(valueWithEscapedSymbols);
        //Filter per pattern with ?, *, [xy], [^x], [a-z]
        const searchedValue = 'Key?[A-z]rS[^o][ae]*';
        await browserPage.searchByKeyName(searchedValue);
        //Verify that key was found
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was found');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName2)).notOk('The key wasn\'t found');
        //Filter with escaped special symbols
        await browserPage.searchByKeyName(searchedValueWithEscapedSymbols);
        //Verify that key was found
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(valueWithEscapedSymbols)).ok('The key was found');
    });
