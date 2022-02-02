import { addNewStandaloneDatabase } from '../../../helpers/database';
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
import { rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const keyTTL = '2147476121';
const expectedTTL = /214747612*/;

fixture `Key details verification`
    .meta({ type: 'smoke' })
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see Hash Key details', async t => {
        const keyName = 'Hash1testKeyForEdit';

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        await browserPage.addHashKey(keyName, keyTTL);
        const keyDetails = await browserPage.keyDetailsHeader.textContent;
        const keyBadge = await browserPage.keyDetailsBadge.textContent;
        const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await t.expect(keyDetails).contains('Hash', 'The Key Type');
        await t.expect(keyDetails).contains('TTL', 'The TTL');
        await t.expect(keyTTLValue).match(expectedTTL, 'The Key TTL');
        await t.expect(keyBadge).contains('Hash', 'The Key Badge');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see List Key details', async t => {
        const keyName = 'List1testKeyForEdit';
  
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        await browserPage.addListKey(keyName, keyTTL);
        const keyDetails = await browserPage.keyDetailsHeader.textContent;
        const keyBadge = await browserPage.keyDetailsBadge.textContent;
        const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await t.expect(keyDetails).contains('List', 'The Key Type');
        await t.expect(keyDetails).contains('TTL', 'The TTL');
        await t.expect(keyTTLValue).match(expectedTTL, 'The Key TTL');
        await t.expect(keyBadge).contains('List', 'The Key Badge');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see Set Key details', async t => {
        const keyName = 'Set1testKeyForEdit';
  
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        await browserPage.addSetKey(keyName, keyTTL);
        const keyDetails = await browserPage.keyDetailsHeader.textContent;
        const keyBadge = await browserPage.keyDetailsBadge.textContent;
        const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await t.expect(keyDetails).contains('Set', 'The Key Type');
        await t.expect(keyDetails).contains('TTL', 'The TTL');
        await t.expect(keyTTLValue).match(expectedTTL, 'The Key TTL');
        await t.expect(keyBadge).contains('Set', 'The Key Badge');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see String Key details', async t => {
        const keyName = 'String1testKeyForEdit';
        const value = 'keyValue12334353434;'

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        await browserPage.addStringKey(keyName, value, keyTTL);
        const keyDetails = await browserPage.keyDetailsHeader.textContent;
        const keyBadge = await browserPage.keyDetailsBadge.textContent;
        const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await t.expect(keyDetails).contains('String', 'The Key Type');
        await t.expect(keyDetails).contains('TTL', 'The TTL');
        await t.expect(keyTTLValue).match(expectedTTL, 'The Key TTL');
        await t.expect(keyBadge).contains('String', 'The Key Badge');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see ZSet Key details', async t => {
        const keyName = 'ZSet1testKeyForEdit';

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        await browserPage.addZSetKey(keyName, '1', keyTTL);
        const keyDetails = await browserPage.keyDetailsHeader.textContent;
        const keyBadge = await browserPage.keyDetailsBadge.textContent;
        const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await t.expect(keyDetails).contains('Sorted Set', 'The Key Type');
        await t.expect(keyDetails).contains('TTL', 'The TTL');
        await t.expect(keyTTLValue).match(expectedTTL, 'The Key TTL');
        await t.expect(keyBadge).contains('Sorted Set', 'The Key Badge');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see JSON Key details', async t => {
        const keyName = 'JSON1testKeyForEdit';
        const jsonValue = '{"employee":{ "name":"John", "age":30, "city":"New York" }}';

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        await browserPage.addJsonKey(keyName, keyTTL, jsonValue);
        const keyDetails = await browserPage.keyDetailsHeader.textContent;
        const keyBadge = await browserPage.keyDetailsBadge.textContent;
        const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

        await t.expect(keyNameFromDetails).contains(keyName, 'The Key Name');
        await t.expect(keyDetails).contains('JSON', 'The Key Type');
        await t.expect(keyDetails).contains('TTL', 'The TTL');
        await t.expect(keyTTLValue).match(expectedTTL, 'The Key TTL');
        await t.expect(keyBadge).contains('JSON', 'The Key Badge');
    });
