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
const formatters = [{
    format: 'JSON',
    fromText: '{ "field": "value" }'
}, {
    format: 'Msgpack',
    fromText: '{ "field": "value" }',
    toText: 'DF00000001A56669656C64A576616C7565'
}, {
    format: 'ASCII',
    fromText: '山女子水 рус ascii',
    toText: '\\xe5\\xb1\\xb1\\xe5\\xa5\\xb3\\xe5\\xad\\x90\\xe6\\xb0\\xb4 \\xd1\\x80\\xd1\\x83\\xd1\\x81 ascii'
}, {
    format: 'HEX',
    fromText: '山女子水 рус ascii',
    toText: 'e5b1b1e5a5b3e5ad90e6b0b420d180d183d181206173636969'
}];

fixture `Formatters`
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
        if (formatter.format === 'JSON' || formatter.format === 'Msgpack') {
            // Open key details and select formatter
            await browserPage.openKeyDetails(keysData[0].keyName);
            await browserPage.selectFormatter(formatter.format);
            await t.click(browserPage.editHashButton);
            await t.typeText(browserPage.hashFieldValueEditor, invalidText, { replace: true, paste: true });
            await t.click(browserPage.applyButton);
            // Verify that invalid value can be saved
            await t.expect(browserPage.hashFieldValue.textContent).contains(invalidText, `Invalid ${formatter.format} value is not saved`);
            await t.click(browserPage.editHashButton);
            await t.typeText(browserPage.hashFieldValueEditor, formatter.fromText, { replace: true, paste: true });
            await t.click(browserPage.applyButton);
            // Verify that valid value can be saved
            await t.expect(browserPage.hashFieldValue.innerText).contains(formatter.fromText, `Valid ${formatter.format} value is not saved`);
            await t.expect(browserPage.hashFieldValue.find(browserPage.cssJsonValue).exists).ok(`Value is not formatted to ${formatter.format}`);
        }
    }
});
test('Verify that user can see tooltip with convertion failed message on hover when data is not valid JSON/Msgpack', async t => {
    // Verify for JSON and Msgpack formatters
    for (const formatter of formatters) {
        if (formatter.format === 'JSON' || formatter.format === 'Msgpack') {
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
    }
});
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Create new keys
        await addKeysViaCli(keysData, formatters[1].fromText);
    })('Verify that user can see highlighted key details in Msgpack format', async t => {
        const valueSelector = browserPage.stringKeyValueInput;
        // Open String key details
        await browserPage.openKeyDetailsByKeyName(keysData[4].keyName);
        // Verify that msgpack value not formatted with default formatter
        await t.expect(valueSelector.find(browserPage.cssJsonValue).exists).notOk('Value is formatted to Msgpack');
        // Add valid msgpack in HEX format
        await browserPage.selectFormatter('HEX');
        await browserPage.editStringKeyValue(formatters[1].toText!);
        await browserPage.selectFormatter('Msgpack');
        // Verify that msgpack value is formatted and highlighted
        await t.expect(valueSelector.innerText).contains('{\n    "field": "value"\n}', 'Value is not saved as msgpack');
        await t.expect(valueSelector.find(browserPage.cssJsonValue).exists).ok('Value is not formatted to Msgpack');
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Create new keys
        await addKeysViaCli(keysData, formatters[2].fromText);
    })('Verify that user can see key details converted to ASCII/HEX format', async t => {
        // Verify for ASCII and HEX formatters
        for (const formatter of formatters) {
            if (formatter.format === 'ASCII' || formatter.format === 'HEX') {
                // Verify for Hash, List, Set, ZSet, String, Stream keys
                for (let i = 0; i < keysData.length; i++) {
                    const valueSelector = Selector(`[data-testid^=${keysData[i].keyName.split('-')[0]}-][data-testid*=${keysData[i].data}]`);
                    await browserPage.openKeyDetailsByKeyName(keysData[i].keyName);
                    // Verify that value not formatted with default formatter
                    await t.expect(valueSelector.innerText).contains(formatter.fromText!, `Value is formatted as ${formatter.format} in Unicode`);
                    await browserPage.selectFormatter(formatter.format);
                    // Verify that value is formatted
                    await t.expect(valueSelector.innerText).contains(formatter.toText!, `Value is formatted to ${formatter.format}`);
                    // Verify that Hash field is formatted to ASCII/HEX
                    if (keysData[i].keyName === 'hash') {
                        await t.expect(browserPage.hashField.innerText).contains(formatter.toText!, `Hash field is not formatted to ${formatter.format}`);
                    }
                }
            }
        }
    });
test('Verify that user can edit value for Hash field in ASCII/HEX and convert then to another format', async t => {
    // Verify for ASCII and HEX formaterrs
    for (const formatter of formatters) {
        if (formatter.format === 'ASCII' || formatter.format === 'HEX') {
            // Open key details and select formatter
            await browserPage.openKeyDetails(keysData[0].keyName);
            await browserPage.selectFormatter(formatter.format);
            // Add value in selected format
            await t.click(browserPage.editHashButton);
            await t.typeText(browserPage.hashFieldValueEditor, formatter.toText!, { replace: true, paste: true });
            await t.click(browserPage.applyButton);
            // Verify that value saved in selected format
            await t.expect(browserPage.hashFieldValue.innerText).contains(formatter.toText!, `${formatter.format} value is not saved`);
            await browserPage.selectFormatter('Unicode');
            // Verify that value converted to Unicode
            await t.expect(browserPage.hashFieldValue.innerText).contains(formatter.fromText!, `${formatter.format} value is not converted to Unicode`);
        }
    }
});
