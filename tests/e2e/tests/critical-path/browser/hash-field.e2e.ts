import { addNewStandaloneDatabase } from '../../../helpers/database';
import { rte } from '../../../helpers/constants';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
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

fixture `Hash Key fields verification`
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
    const keyName = 'Hash1testKeyForAddField';
    const keyTTL = '2147476121';
    const keyFieldValue = 'hashField11111';
    const keyValue = 'hashValue11111!';

test
    .meta({ rte: rte.standalone })
    ('Verify that user can search by full field name in Hash', async t => {
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
