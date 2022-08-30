import { Selector } from 'testcafe';
import { keyLength, rte } from '../../../helpers/constants';
import { addKeysViaCli, deleteKeysViaCli, keyTypes } from '../../../helpers/keys';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
const dataSet = require('../../../test-data/formattersData');

const browserPage = new BrowserPage();
const common = new Common();

const keysData = keyTypes.map(object => ({ ...object })).filter((v, i) => i <= 6 && i !== 5);
keysData.forEach(key => key.keyName = `${key.keyName}` + '-' + `${common.generateWord(keyLength)}`);
const formatters = [{
    format: 'JSON',
    fromText: '{ "field": "value" }',
    fromTextEdit: '{ "field": "value123" }'
}, {
    format: 'Msgpack',
    fromText: '{ "field": "value" }',
    fromTextEdit: '{ "field": "value123" }',
    formattedText: 'DF00000001A56669656C64A576616C7565'
}, {
    format: 'Protobuf',
    fromText: '[ { "1": 2009 }, { "2": 344 } ]',
    formattedText: '08d90f10d802'
}];

fixture `Formatters`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Create new keys
        await addKeysViaCli(keysData);
    })
    .afterEach(async () => {
        // Clear keys and database
        await deleteKeysViaCli(keysData);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .before(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Create new keys
        await addKeysViaCli(keysData, formatters[0].fromText, formatters[0].fromText);
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
            // Verify that Hash field is formatted to json and highlighted
            if (keysData[i].keyName === 'hash') {
                await t.expect(browserPage.hashField.find(browserPage.cssJsonValue).exists).ok('Hash field is not formatted to JSON');
            }
            // Verify that Stream field is formatted to json and highlighted
            if (keysData[i].keyName === 'stream') {
                await t.expect(Selector(browserPage.cssJsonValue).count).eql(2, 'Hash field is not formatted to JSON');
            }
        }
    });
test('Verify that user can edit the values in the key regardless if they are valid in JSON/Msgpack format or not', async t => {
    // Verify for JSON and Msgpack formatters
    const invalidText = 'invalid text';
    for (const formatter of formatters) {
        // Open key details and select formatter
        await browserPage.openKeyDetails(keysData[0].keyName);
        await browserPage.selectFormatter(formatter.format);
        await browserPage.editHashKeyValue(invalidText);
        // Verify that invalid value can be saved
        await t.expect(browserPage.hashFieldValue.textContent).contains(invalidText, `Invalid ${formatter.format} value is not saved`);
        await browserPage.editHashKeyValue(formatter.fromText);
        // Verify that valid value can be saved on edit
        await t.expect(browserPage.hashFieldValue.innerText).contains(formatter.fromText, `Valid ${formatter.format} value is not saved`);
        await t.expect(browserPage.hashFieldValue.find(browserPage.cssJsonValue).exists).ok(`Value is not formatted to ${formatter.format}`);
        await browserPage.editHashKeyValue(formatter.fromTextEdit!);
        // Verify that valid value can be edited to another valid value
        await t.expect(browserPage.hashFieldValue.innerText).contains(formatter.fromTextEdit!, `Valid ${formatter.format} value is not saved`);
        await t.expect(browserPage.hashFieldValue.find(browserPage.cssJsonValue).exists).ok(`Value is not formatted to ${formatter.format}`);
    }
});
test('Verify that user can see tooltip with convertion failed message on hover when data is not valid JSON/Msgpack/Protobuf', async t => {
    // Verify for JSON, Msgpack, Protobuf formatters
    for (const formatter of formatters) {
        const failedMessage = `Failed to convert to ${formatter.format}`;
        for (let i = 0; i < keysData.length; i++) {
            const valueSelector = Selector(`[data-testid^=${keysData[i].keyName.split('-')[0]}-][data-testid*=${keysData[i].data}]`);
            // Open key details and select formatter
            await browserPage.openKeyDetailsByKeyName(keysData[i].keyName);
            await browserPage.selectFormatter(formatter.format);
            // Verify that not valid value is not formatted
            await t.expect(valueSelector.find(browserPage.cssJsonValue).exists).notOk(`${keysData[i].textType} Value is formatted to ${formatter.format}`);
            await t.hover(valueSelector, { offsetX: 5 });
            // Verify that tooltip with convertion failed message displayed
            await t.expect(browserPage.tooltip.textContent).contains(failedMessage, `"${failedMessage}" is not displayed in tooltip`);
        }
    }
});
test
    .before(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Create new keys
        await addKeysViaCli(keysData, formatters[1].fromText);
    })('Verify that user can see highlighted key details in Msgpack format', async t => {
        // Open Hash key details
        await browserPage.openKeyDetailsByKeyName(keysData[0].keyName);
        // Verify that msgpack value not formatted with default formatter
        await t.expect(browserPage.hashFieldValue.find(browserPage.cssJsonValue).exists).notOk('Value is formatted to Msgpack');
        // Add valid msgpack in HEX format
        await browserPage.selectFormatter('HEX');
        await browserPage.editHashKeyValue(formatters[1].formattedText!);
        await browserPage.selectFormatter('Msgpack');
        // Verify that msgpack value is formatted and highlighted
        await t.expect(browserPage.hashFieldValue.innerText).contains(formatters[1].fromText!, 'Value is not saved as msgpack');
        await t.expect(browserPage.hashFieldValue.find(browserPage.cssJsonValue).exists).ok('Value is not formatted to Msgpack');
    });
dataSet.forEach(data => {
    test
        .before(async () => {
            await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
            // Create new keys
            await addKeysViaCli(keysData, data.fromText);
        })(`Verify that user can see key details converted to '${data.format}' format`, async t => {
            // Verify for ASCII, HEX, Binary formatters
            // Verify for Hash, List, Set, ZSet, String, Stream keys
            for (let i = 0; i < keysData.length; i++) {
                const valueSelector = Selector(`[data-testid^=${keysData[i].keyName.split('-')[0]}-][data-testid*=${keysData[i].data}]`);
                await browserPage.openKeyDetailsByKeyName(keysData[i].keyName);
                // Verify that value not formatted with default formatter
                await t.expect(valueSelector.innerText).contains(data.fromText, `Value is formatted as ${data.format} in Unicode`);
                await browserPage.selectFormatter(data.format);
                // Verify that value is formatted
                await t.expect(valueSelector.innerText).contains(data.formattedText!, `Value is not formatted to ${data.format}`);
                // Verify that Hash field is formatted to ASCII/HEX/Binary
                if (keysData[i].keyName === 'hash') {
                    await t.expect(browserPage.hashField.innerText).contains(data.formattedText!, `Hash field is not formatted to ${data.format}`);
                }
            }
        });
    test(`Verify that user can edit value for Hash field in '${data.format}' and convert then to another format`, async t => {
        // Verify for ASCII, HEX, Binary formatters
        // Open key details and select formatter
        await browserPage.openKeyDetails(keysData[0].keyName);
        await browserPage.selectFormatter(data.format);
        // Add value in selected format
        await browserPage.editHashKeyValue(data.formattedText!);
        // Verify that value saved in selected format
        await t.expect(browserPage.hashFieldValue.innerText).contains(data.formattedText!, `${data.format} value is not saved`);
        await browserPage.selectFormatter('Unicode');
        // Verify that value converted to Unicode
        await t.expect(browserPage.hashFieldValue.innerText).contains(data.fromText!, `${data.format} value is not converted to Unicode`);
        await browserPage.selectFormatter(data.format);
        await browserPage.editHashKeyValue(data.formattedTextEdit!);
        // Verify that valid converted value can be edited to another
        await t.expect(browserPage.hashFieldValue.innerText).contains(data.formattedTextEdit!, `${data.format} value is not saved`);
        await browserPage.selectFormatter('Unicode');
        // Verify that value converted to Unicode
        await t.expect(browserPage.hashFieldValue.innerText).contains(data.fromTextEdit!, `${data.format} value is not converted to Unicode`);
    });
});
test('Verify that user can see highlighted key details in Protobuf format', async t => {
    // Open Hash key details
    await browserPage.openKeyDetailsByKeyName(keysData[0].keyName);
    // Add valid Protobuf in HEX format
    await browserPage.selectFormatter('HEX');
    await browserPage.editHashKeyValue(formatters[2].formattedText!);
    await browserPage.selectFormatter('Protobuf');
    // Verify that Protobuf value is formatted and highlighted
    await t.expect(browserPage.hashFieldValue.innerText).contains(formatters[2].fromText!, 'Value is not saved as Protobuf');
    await t.expect(browserPage.hashFieldValue.find(browserPage.cssJsonValue).exists).ok('Value is not formatted to Protobuf');
});
test('Verify that user can see highlighted key details in PHP unserialise format', async t => {
    // Open Hash key details
    await browserPage.openKeyDetailsByKeyName(keysData[0].keyName);
    // Add valid Protobuf in HEX format
    await browserPage.selectFormatter('HEX');
    await browserPage.editHashKeyValue(formatters[2].formattedText!);
    await browserPage.selectFormatter('Protobuf');
    // Verify that Protobuf value is formatted and highlighted
    await t.expect(browserPage.hashFieldValue.innerText).contains(formatters[2].fromText!, 'Value is not saved as Protobuf');
    await t.expect(browserPage.hashFieldValue.find(browserPage.cssJsonValue).exists).ok('Value is not formatted to Protobuf');
});
