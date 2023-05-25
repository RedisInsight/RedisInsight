import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import { rte } from '../../../helpers/constants';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();

let keyName = Common.generateWord(10);

fixture `Cases with large data`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see relevant information about key size', async t => {
    keyName = Common.generateWord(10);
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Create new key with a lot of members
    const length = 500;
    const arr = await Common.createArrayWithKeyValue(length);
    await t.typeText(browserPage.Cli.cliCommandInput, `HSET ${keyName} ${arr.join(' ')}`, { paste: true });
    await t.pressKey('enter');
    await t.click(browserPage.Cli.cliCollapseButton);
    await browserPage.openKeyDetails(keyName);
    // Remember the values of the key size and length
    const keySizeText = await browserPage.keySizeDetails.textContent;
    const keyLength = await browserPage.keyLengthDetails.textContent;
    const sizeArray = keySizeText.split(' ');
    const keySize = sizeArray[sizeArray.length - 2];
    // Verify that user can see relevant information about key length
    await t.expect(keyLength).eql(`Length: ${length}`, 'Key length not correct');
    // Verify that user can see relevant information about key size
    await t.expect(keySizeText).contains('KB', 'Key measure not correct');
    await t.expect(+keySize).gt(10, 'Key size value not correct');
});
