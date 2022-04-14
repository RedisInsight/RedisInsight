import { Chance } from 'chance';
import { Selector } from 'testcafe';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { keyTypes } from '../../../helpers/keys';
import { rte, COMMANDS_TO_CREATE_KEY, keyLength } from '../../../helpers/constants';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const chance = new Chance();

const keyName = chance.word({length: 20});
const keysData = keyTypes.slice(0, 6);
for (const key of keysData) {
    key.keyName = `${key.keyName}` + '-' + `${chance.word({length: keyLength})}`
}
//Arrays with TTL in seconds, min, hours, days, months, years and their values in Browser Page
const ttlForSet = [59, 800, 20000, 2000000, 31000000, 2147483647];
const ttlValues = ['s', '13 min', '5 h', '23 d', '11 mo', '68 yr'];

fixture `TTL values in Keys Table`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        //Clear and delete database
        for (let i = 0; i < keysData.length; i++) {
            await browserPage.deleteKey();
        }
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can see TTL in the list of keys rounded down to the nearest unit', async t => {
    //Create new keys with TTL
    await t.click(cliPage.cliExpandButton);
    for (let i = 0; i < keysData.length; i++) {
        await t.typeText(cliPage.cliCommandInput, COMMANDS_TO_CREATE_KEY[keysData[i].textType](keysData[i].keyName), {paste: true});
        await t.pressKey('enter');
        await t.typeText(cliPage.cliCommandInput, `EXPIRE ${keysData[i].keyName} ${ttlForSet[i]}`, {paste: true});
        await t.pressKey('enter');
    }
    await t.click(cliPage.cliCollapseButton);
    //Refresh Keys in Browser
    await t.click(browserPage.refreshKeysButton);
    //Check that Keys has correct TTL value in keys table
    for (let i = 0; i < keysData.length; i++) {
        const ttlValueElement = Selector(`[data-testid="ttl-${keysData[i].keyName}"]`);
        await t.expect(ttlValueElement.textContent).contains(ttlValues[i], `TTL value in keys table is ${ttlValues[i]}`);
    }
});
test
    .after(async() => {
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that Key is deleted if TTL finishes', async t => {
        // Create new key with TTL
        await browserPage.addStringKey(keyName, 'test', '3');
        await t.click(browserPage.refreshKeysButton);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('Added key');
        await t.wait(3000);
        await t.click(browserPage.refreshKeysButton);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).notOk('Not displayed key');
    });
