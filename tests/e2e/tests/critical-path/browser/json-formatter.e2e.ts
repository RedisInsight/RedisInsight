import { Selector } from 'testcafe';
import { keyLength, rte } from '../../../helpers/constants';
import { addKeysViaCli, deleteKeysViaCli, keyTypes } from '../../../helpers/keys';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();
const common = new Common();

const keysData = keyTypes.map(object => ({ ...object })).filter((v, i) => i <= 6 && i !== 5);
keysData.forEach(key => key.keyName = `${key.keyName}` + '-' + `${common.generateWord(keyLength)}`);
const jsonText = '{ "field": "value" }';

fixture `JSON formatter`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Create new keys
        await addKeysViaCli(keysData);
    })
    .afterEach(async() => {
        // Clear keys and database
        await deleteKeysViaCli(keysData);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Create new keys
        await addKeysViaCli(keysData, jsonText);
    })('Verify that user can see highlighted key details in JSON format', async t => {
        // Verify for Hash, List, Set, ZSet, String, Stream keys
        for (let i = 0; i < keysData.length; i++) {
            const valueSelector = Selector(`[data-testid^=${keysData[i].keyName.split('-')[0]}-][data-testid*=${keysData[i].data}]`);
            await browserPage.openKeyDetailsByKeyName(keysData[i].keyName);
            // Verify that json value not formatted with default formatter
            await t.expect(valueSelector.find(browserPage.cssJsonValue).exists).notOk(`${keysData[i].textType} Value is formatted to JSON`);
            await browserPage.selectFormatter('JSON');
            // Verify that json value is formatted and highlighted
            await t.expect(valueSelector.find(browserPage.cssJsonValue).exists).ok(`${keysData[i].textType} Value is not formatted to JSON`);
        }
    });
test('Verify that user can edit the values in the key regardless if they are valid in JSON format or not', async t => {
    const invalidJson = 'invalid json text';
    // Open key details and select JSON formatter
    await browserPage.openKeyDetails(keysData[0].keyName);
    await browserPage.selectFormatter('JSON');
    await t.click(browserPage.editHashButton);
    await t.typeText(browserPage.hashFieldValueEditor, invalidJson, { replace: true, paste: true });
    await t.click(browserPage.applyButton);
    // Verify that invalid json value can be saved
    await t.expect(browserPage.hashFieldValue.textContent).contains(invalidJson, 'Invalid json value is not saved');
    await t.click(browserPage.editHashButton);
    await t.typeText(browserPage.hashFieldValueEditor, jsonText, { replace: true, paste: true });
    await t.click(browserPage.applyButton);
    // Verify that valid json value can be saved
    await t.expect(browserPage.hashFieldValue.innerText).contains(jsonText, 'Invalid json value is not saved');
    await t.expect(browserPage.hashFieldValue.find(browserPage.cssJsonValue).exists).ok('Value is not formatted to JSON');
});
test('Verify that user can see tooltip with convertion failed message on hover when data is not valid JSON', async t => {
    const failedMessage = 'Failed to convert to JSON';
    for (let i = 0; i < keysData.length; i++) {
        const valueSelector = Selector(`[data-testid^=${keysData[i].keyName.split('-')[0]}-][data-testid*=${keysData[i].data}]`);
        // Open key details and select JSON formatter
        await browserPage.openKeyDetailsByKeyName(keysData[i].keyName);
        await browserPage.selectFormatter('JSON');
        // Verify that not valid json value is not formatted
        await t.expect(valueSelector.find(browserPage.cssJsonValue).exists).notOk(`${keysData[i].textType} Value is formatted to JSON`);
        await t.hover(valueSelector, { offsetX: 5 });
        // Verify that tooltip with convertion failed message displayed
        await t.expect(browserPage.tooltip.textContent).contains(failedMessage, `"${failedMessage}" is not displayed in tooltip`);
    }
});
