import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();
const cliPage = new CliPage();

const searchedKeyName = 'KeyForSearch\\*\\?\\[]789';

fixture `Filtering per key name in Browser page`
    .meta({type: 'smoke'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await clearDatabaseInCli();
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can search per full key name', async t => {
    const keyName = 'KeyForSearch*?[]789';
    //Add new key
    await browserPage.addStringKey(keyName);
    //Search by key with full name
    await browserPage.searchByKeyName(searchedKeyName);
    //Verify that key was found
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key was found');
});
test('Verify that user can filter per exact key without using any patterns', async t => {
    const keyName = 'KeyForSearch*?[]789';
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Create new key for search
    await t.typeText(cliPage.cliCommandInput, `APPEND ${keyName} 1`);
    await t.pressKey('enter');
    await t.click(cliPage.cliCollapseButton);
    //Filter per exact key without using any patterns
    await browserPage.searchByKeyName(searchedKeyName);
    //Verify that key was found
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was found');
});
test('Verify that user can filter per combined pattern with ?, *, [xy], [^x], [a-z] and escaped special symbols', async t => {
    const keyName = 'KeyForSearch';
    const keyName2 = 'KeyForSomething';
    const valueWithEscapedSymbols = 'KeyFor[A-G]*(';
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
    const searchedValueWithEscapedSymbols = 'KeyFor\\[A-G\\]\\*\\(';
    await browserPage.searchByKeyName(searchedValueWithEscapedSymbols);
    //Verify that key was found
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(valueWithEscapedSymbols)).ok('The key was found');
});
