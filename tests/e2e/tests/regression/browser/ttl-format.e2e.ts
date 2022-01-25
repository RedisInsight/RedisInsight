import { Selector } from 'testcafe';
import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { keyTypes, getRandomKeyName } from '../../../helpers/keys';
import { COMMANDS_TO_CREATE_KEY, keyLength } from '../../../helpers/constants';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const keysData = keyTypes.slice(0, 6);
for (const key of keysData) {
    key.keyName = `${key.keyName}` + '-' + `${getRandomKeyName(keyLength)}`
}
//Arrays with TTL in seconds, min, hours, days, months, years and their values in Browser Page
const ttlForSet = [59, 800, 20000, 2000000, 31000000, 2147483647];
const ttlValues = ['s', '13 min', '5 h', '23 d', '11 mo', '68 yr'];

fixture `TTL values in Keys Table`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await clearDatabaseInCli();
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can see TTL in the list of keys rounded down to the nearest unit', async t => {
    //Create new keys with TTL
    await t.click(cliPage.cliExpandButton);
    for (let i = 0; i < keysData.length; i++) {
        await t.typeText(cliPage.cliCommandInput, COMMANDS_TO_CREATE_KEY[keysData[i].textType](keysData[i].keyName));
        await t.pressKey('enter');
        await t.typeText(cliPage.cliCommandInput, `EXPIRE ${keysData[i].keyName} ${ttlForSet[i]}`);
        await t.pressKey('enter');
    }
    await t.click(cliPage.cliCollapseButton);
    //Refresh Keys in Browser
    await t.click(browserPage.refreshKeysButton);
    //Check that Keys has correct TTL value in keys table
    for (let i = 0; i < keysData.length; i++) {
        const ttlValueElement = Selector(`[data-testid="ttl-${keysData[i].keyName}"]`);
        await t.expect(ttlValueElement.textContent).contains(ttlValues[i], 'TTL value in keys table');
    }
});
