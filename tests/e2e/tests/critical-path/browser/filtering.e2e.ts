import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import {
    BrowserPage,
    CliPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { COMMANDS_TO_CREATE_KEY, KeyTypesTexts } from '../../../helpers/constants';
import { keyTypes } from '../../../helpers/keys';

const browserPage = new BrowserPage();
const cliPage = new CliPage();

fixture `Filtering per key name in Browser page`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await clearDatabaseInCli();
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can search a key with selected data type is filters', async t => {
    const keyName = 'KeyForSearch';
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
    //Create new keys
    await t.click(cliPage.cliExpandButton);
    for (const { textType, keyName } of keyTypes) {
        if (textType in COMMANDS_TO_CREATE_KEY) {
            await t.typeText(cliPage.cliCommandInput, COMMANDS_TO_CREATE_KEY[textType](keyName));
            await t.pressKey('enter');
        }
    }
    await t.click(cliPage.cliCollapseButton);

    for (const { textType, keyName } of keyTypes) {
        await browserPage.selectFilterGroupType(textType);
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
        await t.expect(isKeyIsDisplayedInTheList).ok(`The key of type ${textType} was found`);
    }
});
