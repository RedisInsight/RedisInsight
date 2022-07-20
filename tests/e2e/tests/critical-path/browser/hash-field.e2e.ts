import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });
const keyTTL = '2147476121';
const keyFieldValue = 'hashField11111';
const keyValue = 'hashValue11111!';

fixture `Hash Key fields verification`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can search by full field name in Hash', async t => {
        keyName = keyName = chance.word({ length: 10 });
        await browserPage.addHashKey(keyName, keyTTL);
        //Add field to the hash key
        await browserPage.addFieldToHash(keyFieldValue, keyValue);
        //Search by full field name
        await browserPage.searchByTheValueInKeyDetails(keyFieldValue);
        //Check the search result
        const result = await browserPage.hashFieldsList.nth(0).textContent;
        await t.expect(result).eql(keyFieldValue, 'The hash field');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can search by part field name in Hash with pattern * in Hash', async t => {
        keyName = chance.word({ length: 10 });
        await browserPage.addHashKey(keyName, keyTTL);
        //Add field to the hash key
        await browserPage.addFieldToHash(keyFieldValue, keyValue);
        //Search by part field name and the * in the end
        await browserPage.searchByTheValueInKeyDetails('hashField*');
        //Check the search result
        let result = await browserPage.hashFieldsList.nth(0).textContent;
        await t.expect(result).eql(keyFieldValue, 'The hash field');
        //Search by part field name and the * in the beggining
        await browserPage.searchByTheValueInKeyDetails('*11111');
        //Check the search result
        result = await browserPage.hashFieldsList.nth(0).textContent;
        await t.expect(result).eql(keyFieldValue, 'The hash field');
        //Search by part field name and the * in the middle
        await browserPage.searchByTheValueInKeyDetails('hash*11111');
        //Check the search result
        result = await browserPage.hashFieldsList.nth(0).textContent;
        await t.expect(result).eql(keyFieldValue, 'The hash field');
    });
