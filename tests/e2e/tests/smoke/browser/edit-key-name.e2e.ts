import { rte } from '../../../helpers/constants';
import { DatabaseHelper } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { Telemetry } from '../../../helpers/telemetry';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const telemetry = new Telemetry();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyNameBefore = Common.generateWord(10);
let keyNameAfter = Common.generateWord(10);
const keyTTL = '2147476121';
const logger = telemetry.createLogger();
const telemetryEvent = 'BROWSER_KEY_VALUE_VIEWED';
const expectedProperties = [
    'databaseId',
    'keyType',
    'length'
];

fixture `Edit Key names verification`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyNameAfter, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .requestHooks(logger)('Verify that user can edit String Key name', async t => {
        keyNameBefore = Common.generateWord(10);
        keyNameAfter = Common.generateWord(10);

        await browserPage.addStringKey(keyNameBefore, keyTTL);
        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The String Key Name not correct before editing');

        // Verify that telemetry event 'BROWSER_KEY_VALUE_VIEWED' sent and has all expected properties
        await telemetry.verifyEventHasProperties(telemetryEvent, expectedProperties, logger);
        await telemetry.verifyEventPropertyValue(telemetryEvent, 'keyType', 'string', logger);

        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The String Key Name not correct after editing');
    });
test('Verify that user can edit Set Key name', async t => {
    keyNameBefore = Common.generateWord(10);
    keyNameAfter = Common.generateWord(10);

    await browserPage.addSetKey(keyNameBefore, keyTTL);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Set Key Name not correct before editing');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Set Key Name not correct after editing');
});
test('Verify that user can edit Zset Key name', async t => {
    keyNameBefore = Common.generateWord(10);
    keyNameAfter = Common.generateWord(10);

    await browserPage.addZSetKey(keyNameBefore, keyTTL);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Zset Key Name not correct before editing');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Zset Key Name not correct after editing');
});
test('Verify that user can edit Hash Key name', async t => {
    keyNameBefore = Common.generateWord(10);
    keyNameAfter = Common.generateWord(10);

    await browserPage.addHashKey(keyNameBefore, keyTTL);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Hash Key Name not correct before editing');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Hash Key Name not correct after editing');
});
test('Verify that user can edit List Key name', async t => {
    keyNameBefore = Common.generateWord(10);
    keyNameAfter = Common.generateWord(10);

    await browserPage.addListKey(keyNameBefore, keyTTL);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The List Key Name not correct before editing');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The List Key Name not correct after editing');
});
test('Verify that user can edit JSON Key name', async t => {
    keyNameBefore = Common.generateWord(10);
    keyNameAfter = Common.generateWord(10);
    const keyValue = '{"name":"xyz"}';

    await browserPage.addJsonKey(keyNameBefore, keyValue, keyTTL);
    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The JSON Key Name not correct before editing');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The JSON Key Name not correct after editing');
});
