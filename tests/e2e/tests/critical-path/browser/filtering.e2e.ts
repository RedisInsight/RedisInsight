import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import {
    BrowserPage,
    CliPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { COMMANDS_TO_CREATE_KEY, KeyTypesTexts, rte } from '../../../helpers/constants';
import { keyTypes } from '../../../helpers/keys';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });

fixture `Filtering per key name in Browser page`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
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
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can filter keys per data type in Browser page', async t => {
        keyName = chance.word({ length: 10 });
        //Create new keys
        await t.click(cliPage.cliExpandButton);
        for (const { textType, keyName } of keyTypes) {
            if (textType in COMMANDS_TO_CREATE_KEY) {
                await t.typeText(cliPage.cliCommandInput, COMMANDS_TO_CREATE_KEY[textType](keyName), { paste: true });
                await t.pressKey('enter');
            }
        }
        await t.click(cliPage.cliCollapseButton);
        await t.click(browserPage.refreshKeysButton);
        for (const { textType, keyName } of keyTypes) {
            await browserPage.selectFilterGroupType(textType);
            await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok(`The key of type ${textType} was found`);
            await browserPage.deleteKey();
        }
    });
