import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { populateHashWithFields } from '../../../helpers/keys';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();

const dbParameters = { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port };
const keyName = `TestHashKey-${Common.generateWord(10)}`;
const fieldForSearch = `SearchField-${Common.generateWord(5)}`;
const keyToAddParameters = { fieldsCount: 500000, keyName, fieldStartWith: 'hashField', fieldValueStartWith: 'hashValue' };

fixture `Hash Key fields verification`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await browserPage.addHashKey(keyName, '2147476121', 'field', 'value');
    })
    .afterEach(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can search per exact field name in Hash in DB with 1 million of fields', async t => {
    // Add 1000000 fields to the hash key
    await populateHashWithFields(dbParameters.host, dbParameters.port, keyToAddParameters);
    await populateHashWithFields(dbParameters.host, dbParameters.port, keyToAddParameters);
    // Add custom field to the hash key
    await browserPage.openKeyDetails(keyName);
    await browserPage.addFieldToHash(fieldForSearch, 'testHashValue');
    // Search by full field name
    await browserPage.searchByTheValueInKeyDetails(fieldForSearch);
    // Check the search result
    const result = await browserPage.hashFieldsList.nth(0).textContent;
    await t.expect(result).eql(fieldForSearch, 'Hash field not found');
});
