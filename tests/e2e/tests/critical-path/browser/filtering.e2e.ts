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
import { COMMANDS_TO_CREATE_KEY, KeyTypesTexts } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const cliPage = new CliPage();

const filteringTypes = [
    { textType: KeyTypesTexts.Hash, keyName: 'hash' },
    { textType: KeyTypesTexts.Set, keyName: 'set' },
    { textType: KeyTypesTexts.ZSet, keyName: 'zset' },
    { textType: KeyTypesTexts.List, keyName: 'list' },
    { textType: KeyTypesTexts.String, keyName: 'string' },
    { textType: KeyTypesTexts.Graph, keyName: 'graph' },
    { textType: KeyTypesTexts.ReJSON, keyName: 'json' },
    { textType: KeyTypesTexts.Stream, keyName: 'stream' },
    { textType: KeyTypesTexts.TimeSeries, keyName: 'timeSeries' }
]

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
        //Clear database
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
    })
test('Verify that user can search a key with selected data type is filters', async t => {
    const keyName = 'KeyForSearch';
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Add new key
    await browserPage.addStringKey(keyName);
    //Search by key with full name & specified type
    await browserPage.selectFilterGroupType(KeyTypesTexts.String)
    await browserPage.searchByKeyName(keyName);
    //Verify that key was found
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key was found');
});
test('Verify that user can filter keys per data type in Browser page', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

    //Create new keys
    await t.click(cliPage.cliExpandButton);
    for (const { textType, keyName } of filteringTypes) {
        if (textType in COMMANDS_TO_CREATE_KEY) {
            await t.typeText(cliPage.cliCommandInput, COMMANDS_TO_CREATE_KEY[textType](keyName));
            await t.pressKey('enter');
        }
    }
    await t.click(cliPage.cliCollapseButton);

    for (const { textType, keyName } of filteringTypes) {
        await browserPage.selectFilterGroupType(textType);
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
        await t.expect(isKeyIsDisplayedInTheList).ok(`The key of type ${textType} was found`);
    }
});
