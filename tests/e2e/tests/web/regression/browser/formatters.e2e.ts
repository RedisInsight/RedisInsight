import { rte } from '../../../../helpers/constants';
import { populateHashWithFields } from '../../../../helpers/keys';
import { Common, DatabaseHelper } from '../../../../helpers';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossStandaloneRedisearch } from '../../../../helpers/conf';
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
        type: 'critical_path',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);

        await populateHashWithFields(ossStandaloneRedisearch.host, ossStandaloneRedisearch.port, keyToAddParameters);
    })
    .afterEach(async() => {
        // Clear keys and database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });

test('Verify that dataTime is displayed in Java serialized', async t => {
    const hexValue ='ACED00057372000E6A6176612E7574696C2E44617465686A81014B59741903000078707708000000BEACD0567278';
    const javaTimeValue = '"1995-12-14T12:12:01.010Z"'

    await browserPage.openKeyDetailsByKeyName(keyName);
    // Add valid value in HEX format for convertion
    await browserPage.selectFormatter('HEX');
    await browserPage.editHashKeyValue(hexValue);
    await browserPage.selectFormatter('Java serialized');
    await t.expect(browserPage.hashFieldValue.innerText).eql(javaTimeValue, 'data is not serialized in java')

});
