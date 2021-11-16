import { addNewStandaloneDatabase } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage,
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
const common = new Common();

fixture `Cases with large data`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async() => {
        await browserPage.deleteKey();
    })
test('Verify that user can see relevant information about key size', async t => {
    const keyName = 'HashKey-Lorem123';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Create new key with a lot of members
    const arr = await common.createArrayWithKeyValue(500);
    await t.typeText(cliPage.cliCommandInput, `HSET ${keyName} ${arr.join(' ')}`, { paste: true });
    await t.pressKey('enter');
    await t.click(cliPage.cliCollapseButton);
    //Remember the values of the key size
    await browserPage.openKeyDetails(keyName);
    const keySizeText = await browserPage.keySizeDetails.textContent;
    const keySize = keySizeText.split('KB')[0];
    //Verify that user can see relevant information about key size
    await t.expect(keySizeText).contains('KB', 'Key size text');
    await t.expect(+keySize).gt(5, 'Key size value');
});
test('Verify that user can see relevant information about key length', async t => {
    const keyName = 'HashKey-Lorem123';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Create new key with a lot of members
    const length = 500;
    const arr = await common.createArrayWithKeyValue(length);
    await t.typeText(cliPage.cliCommandInput, `HSET ${keyName} ${arr.join(' ')}`, { paste: true });
    await t.pressKey('enter');
    await t.click(cliPage.cliCollapseButton);
    //Remember the values of the key size
    await browserPage.openKeyDetails(keyName);
    const keyLength = await browserPage.keyLengthDetails.textContent;
    //Verify that user can see relevant information about key size
    await t.expect(keyLength).eql(`Length (${length})`, 'Key length');
});
