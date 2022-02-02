import { Selector } from 'testcafe';
import { addNewStandaloneDatabase } from '../../../helpers/database';
import { keyTypes, getRandomKeyName } from '../../../helpers/keys';
import {COMMANDS_TO_CREATE_KEY, keyLength} from '../../../helpers/constants';
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
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    })
    .afterEach(async t => {
        //Flush DB
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
    });
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
