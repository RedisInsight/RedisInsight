import { rte } from '../../../helpers/constants';
import { DatabaseHelper } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

const keyTTL = '2147476121';
const keyValueBefore = 'ValueBeforeEdit!';
const keyValueAfter = 'ValueAfterEdit!';
let keyName = Common.generateWord(10);

fixture `Edit Key values verification`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can edit String value', async t => {
    keyName = Common.generateWord(10);

    // Add string key
    await browserPage.addStringKey(keyName, keyValueBefore, keyTTL);
    // Check the key value before edit
    let keyValue = await browserPage.getStringKeyValue();
    await t.expect(keyValue).contains(keyValueBefore, 'The String value is incorrect');
    // Edit String key value
    await browserPage.editStringKeyValue(keyValueAfter);
    // Check the key value after edit
    keyValue = await browserPage.getStringKeyValue();
    await t.expect(keyValue).contains(keyValueAfter, 'Edited String value is incorrect');
});
test('Verify that user can edit Zset Key member', async t => {
    keyName = Common.generateWord(10);
    const scoreBefore = '5';
    const scoreAfter = '10';

    // Add zset key
    await browserPage.addZSetKey(keyName, scoreBefore, keyTTL, keyValueBefore);
    // Check the key score before edit
    let zsetScore = await browserPage.getZsetKeyScore();
    await t.expect(zsetScore).eql(scoreBefore, 'Zset Score is incorrect');
    // Edit Zset key score
    await browserPage.editZsetKeyScore(scoreAfter);
    // Check Zset key score after edit
    zsetScore = await browserPage.getZsetKeyScore();
    await t.expect(zsetScore).contains(scoreAfter, 'Zset Score is not edited');
});
test('Verify that user can edit Hash Key field', async t => {
    const fieldName = 'test';
    keyName = Common.generateWord(10);

    // Add Hash key
    await browserPage.addHashKey(keyName, keyTTL, fieldName, keyValueBefore);
    // Check the key value before edit
    let keyValue = await browserPage.getHashKeyValue();
    await t.expect(keyValue).eql(keyValueBefore, 'The Hash value is incorrect');
    // Edit Hash key value
    await browserPage.editHashKeyValue(keyValueAfter);
    // Check Hash key value after edit
    keyValue = await browserPage.getHashKeyValue();
    await t.expect(keyValue).contains(keyValueAfter, 'Edited Hash value is incorrect');
});
test('Verify that user can edit List Key element', async t => {
    keyName = Common.generateWord(10);

    // Add List key
    await browserPage.addListKey(keyName, keyTTL, keyValueBefore);
    // Check the key value before edit
    let keyValue = await browserPage.getListKeyValue();
    await t.expect(keyValue).eql(keyValueBefore, 'The List value is incorrect');
    // Edit List key value
    await browserPage.editListKeyValue(keyValueAfter);
    // Check List key value after edit
    keyValue = await browserPage.getListKeyValue();
    await t.expect(keyValue).contains(keyValueAfter, 'Edited List value is incorrect');
});
test('Verify that user can edit JSON Key value', async t => {
    const jsonValueBefore = '{"name":"xyz"}';
    const jsonEditedValue = '"xyz test"';
    const jsonValueAfter = '{name:"xyz test"}';
    keyName = Common.generateWord(10);

    // Add JSON key with json object
    await browserPage.addJsonKey(keyName, jsonValueBefore, keyTTL);
    // Check the key value before edit
    await t.expect(await browserPage.getJsonKeyValue()).eql('{name:"xyz"}', 'The JSON value is incorrect');
    // Edit JSON key value
    await browserPage.editJsonKeyValue(jsonEditedValue);
    // Check JSON key value after edit
    await t.expect(await browserPage.getJsonKeyValue()).contains(jsonValueAfter, 'Edited JSON value is incorrect');
});
