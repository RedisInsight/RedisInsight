import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const cliPage = new CliPage();

fixture `Filtering per key name in Browser page`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async t => {
        //await browserPage.deleteKeyByName(searchedKeyName);
        //Clear database
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
    })
test
    .meta({ rte: 'standalone' })
    ('Verify that when user searches not existed key, he can see the standard screen when there are no keys found', async t => {
        const keyName = 'KeyForSearch*?[]789';
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
    .meta({ rte: 'standalone' })
    ('Verify that user can filter per pattern with * (matches keys with any number of characters instead of *)', async t => {
        const keyName = 'KeyForSearch*?[]789';
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Add new key
        await browserPage.addStringKey(keyName);
        //Filter per pattern with *
        const searchedValue = 'KeyForSear*';
        await browserPage.searchByKeyName(searchedValue);
        //Verify that key was found
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was found');
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that user can filter per pattern with ? (matches keys with any character (only one) instead of ?)', async t => {
        const keyName = 'KeyForSearch*?[]789';
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Add new key
        await browserPage.addStringKey(keyName);
        //Filter per pattern with ?
        const searchedValue = '?eyForSearch\\*\\?\\[]789';
        await browserPage.searchByKeyName(searchedValue);
        //Verify that key was found
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was found');
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that user can filter per pattern with [xy] (matches one symbol: either x or y))', async t => {
        const keyName = 'KeyForSearch';
        const keyName2 = 'KeyForFearch';
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
    .meta({ rte: 'standalone' })
    ('Verify that user can filter per pattern with [^x] (matches one symbol except x)', async t => {
        const keyName = 'KeyForSearch';
        const keyName2 = 'KeyForFearch';
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
    .meta({ rte: 'standalone' })
    ('Verify that user can filter per pattern with [a-z] (matches any symbol in range from A till Z)', async t => {
        const keyName = 'KeyForSearch';
        const keyName2 = 'KeyForFearch';
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
