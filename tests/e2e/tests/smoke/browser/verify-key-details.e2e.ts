import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage} from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });
const keyTTL = '2147476121';
const expectedTTL = /214747612*/;

fixture `Key details verification`
    .meta({ type: 'smoke' })
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
    ('Verify that user can see Hash Key details', async t => {
        keyName = chance.word({ length: 10 });

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
        keyName = chance.word({ length: 10 });

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
        keyName = chance.word({ length: 10 });

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
        keyName = chance.word({ length: 10 });
        const value = 'keyValue12334353434;'

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
        keyName = chance.word({ length: 10 });

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
        keyName = chance.word({ length: 10 });

        const jsonValue = '{"employee":{ "name":"John", "age":30, "city":"New York" }}';

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
    