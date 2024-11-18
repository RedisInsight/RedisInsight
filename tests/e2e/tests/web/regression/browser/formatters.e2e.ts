import { rte } from '../../../../helpers/constants';
import { populateHashWithFields } from '../../../../helpers/keys';
import { Common, DatabaseHelper } from '../../../../helpers';
import { BrowserPage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneV8Config
} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';
const apiKeyRequests = new APIKeyRequests();


const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const keyName = `TestHashKey-${ Common.generateWord(10) }`;
const keyToAddParameters = { fieldsCount: 1, keyName, fieldStartWith: 'hashField', fieldValueStartWith: 'hashValue' };

fixture `Formatters`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV8Config);

        await populateHashWithFields(ossStandaloneV8Config.host, ossStandaloneV8Config.port, keyToAddParameters);
    })
    .afterEach(async() => {
        // Clear keys and database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneV8Config.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneV8Config);
    });

test.before(async t => {
    await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV8Config);

})('Verify that UTF8 in PHP serialized', async t => {
    const phpValueChinese = '测试';
    const phpValueCRussian = 'Привет мир!';
    const setValue =`SET ${keyName} "a:3:{s:4:\\"name\\";s:6:\\"${phpValueChinese}\\";s:3:\\"age\\";i:30;s:7:\\"message\\";s:20:\\"${phpValueCRussian}\\";}"\n`;

    await browserPage.Cli.sendCommandInCli(setValue);
    await t.click(browserPage.refreshKeysButton);

    await browserPage.openKeyDetailsByKeyName(keyName);
    await browserPage.selectFormatter('PHP serialized');
    await t.expect(await browserPage.getStringKeyValue()).contains(phpValueChinese, 'data is not serialized in php');
    await t.expect(await browserPage.getStringKeyValue()).contains(phpValueCRussian, 'data is not serialized in php');
});
