import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import { rte } from '../../../helpers/constants';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const common = new Common();
const chance = new Chance();

let keyName = chance.word({ length: 10 });

fixture `Cases with large data`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see relevant information about key size', async t => {
        keyName = chance.word({ length: 10 });
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see relevant information about key length', async t => {
        keyName = chance.word({ length: 10 });
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
