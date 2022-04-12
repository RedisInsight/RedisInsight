import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import {
    BrowserPage,
    CliPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
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
    .meta({type: 'critical_path', rte: rte.standalone})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
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
test
    .before(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneBigConfig.databaseName);
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
