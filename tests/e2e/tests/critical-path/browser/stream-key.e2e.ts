import { Chance } from 'chance';
import { Selector } from 'testcafe';
import { toNumber, toString } from 'lodash';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 20 });
const keyField = chance.word({ length: 20 });
const keyValue = chance.word({ length: 20 });

fixture `Stream Key`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that user can create Stream key via Add New Key form', async t => {
    keyName = chance.word({ length: 20 });
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    // Verify that user can see Stream details opened after key creation
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).visible).ok('Stream Key Name');
    // Verify that user can see newly added Stream key in key list clicking on keys refresh button
    await t.click(browserPage.refreshKeysButton);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('Stream is added');
});
test('Verify that user can add several fields and values during Stream key creation', async t => {
    const keyName = chance.word({ length: 20 });
    // Create an array with different data types for Stream fields
    const streamData = {'string': chance.word({ length: 20 }), 'array': `[${chance.word({ length: 20 })}, ${chance.integer()}]`, 'integer': `${chance.integer()}`, 'json': '{\'test\': \'test\'}', 'null': 'null', 'boolean': 'true'};
    const scrollSelector = Selector('.eui-yScroll').nth(-1);
    // Open Add New Stream Key Form
    await browserPage.commonAddNewKey(keyName);
    await t.click(browserPage.streamOption);
    // Verify that user can see Entity ID filled by * by default on add Stream key form
    await t.expect(browserPage.streamEntryId.withAttribute('value', '*').visible).ok('Preselected Stream Entity ID field');
    // Verify that user can specify valid custom value for Entry ID
    await t.typeText(browserPage.streamEntryId, '0-1', {replace: true});
    // Filled fields and value by different data types
    for (let i = 0; i < Object.keys(streamData).length; i++) {
        await t.typeText(browserPage.streamField.nth(-1), Object.keys(streamData)[i]);
        await t.typeText(browserPage.streamValue.nth(-1), Object.values(streamData)[i]);
        await t.scroll(scrollSelector, 'bottom');
        await t.expect(browserPage.streamField.count).eql(i + 1, 'Number of added fields');
        if (i < Object.keys(streamData).length - 1) {
            await t.click(browserPage.addStreamRow);
        }
    }
    await t.expect(browserPage.addKeyButton.withAttribute('disabled').exists).notOk('Clickable Add Key button');
    await t.click(browserPage.addKeyButton);
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).visible).ok('Stream Key Name');
});
test('Verify that user can add new Stream Entry for Stream data type key which has an Entry ID, Field and Value', async t => {
    keyName = chance.word({ length: 20 });
    const newField = chance.word({ length: 20 });
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    // Verify that when user adds a new Entry with not existed Field name, a new Field is added to the Stream
    const paramsBeforeEntryAdding = await browserPage.getStreamRowColumnNumber();
    await browserPage.addEntryToStream(newField, chance.word({ length: 20 }));
    // Compare that after adding new entry, new column and row were added
    const paramsAfterEntryAdding = await browserPage.getStreamRowColumnNumber();
    await t.expect(paramsAfterEntryAdding[0]).eql(toString(toNumber(paramsBeforeEntryAdding[0]) + 1), 'Increased number of columns after adding');
    await t.expect(paramsAfterEntryAdding[1]).eql(toString(toNumber(paramsBeforeEntryAdding[1]) + 1), 'Increased number of rows after adding');
    // Verify that when user adds a new Entry with already existed Field name, a new Field is available as column in the Stream table
    await browserPage.addEntryToStream(newField, chance.word({ length: 20 }));
    const paramsAfterExistedFieldAdding = await browserPage.getStreamRowColumnNumber();
    await t.expect(paramsAfterExistedFieldAdding[1]).eql(toString(toNumber(paramsAfterEntryAdding[1]) + 1), 'Increased number of rows after adding');
    await t.expect(paramsAfterExistedFieldAdding[0]).eql(paramsAfterEntryAdding[0], 'The same number of columns after adding');
});
test('Verify that during new entry adding to existing Stream, user can clear the value and the row itself', async t => {
    keyName = chance.word({ length: 20 });
    // Generate data for stream
    const fields = [keyField, chance.word({ length: 20 })];
    const values = [keyValue, chance.word({ length: 20 })];
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    await t.click(browserPage.addNewStreamEntry);
    await browserPage.fulfillSeveralStreamFields(fields, values);
    // Check number of rows
    const fieldsNumberBeforeDeletion = await browserPage.streamField.count;
    // Click on delete field for the last entity
    await t.click(browserPage.clearStreamEntryInputs.nth(-1));
    const fieldsNumberAfterDeletion = await browserPage.streamField.count;
    await t.expect(fieldsNumberAfterDeletion).lt(fieldsNumberBeforeDeletion, 'Number of fields after deletion');
    // Validate that the last field and value were fulfilled
    await t.expect(browserPage.streamField.withAttribute('value', keyField).exists).ok('Filled input for field');
    await t.expect(browserPage.streamValue.withAttribute('value', keyValue).exists).ok('Filled input for value');
    // Click on clear button
    await t.hover(browserPage.streamValue);
    await t.click(browserPage.clearStreamEntryInputs);
    // Validate that data was cleared
    await t.expect(browserPage.streamField.withAttribute('value', keyField).exists).notOk('Cleared input for field');
    await t.expect(browserPage.streamValue.withAttribute('value', keyValue).exists).notOk('Cleared input for value');
    // Validate that the form is still displayed
    await t.expect(browserPage.streamField.count).eql(fieldsNumberAfterDeletion, 'Number of fields after deletion');
});
test('Verify that user can add several fields and values to the existing Stream Key', async t => {
    keyName = chance.word({ length: 20 });
    // Generate field value data
    const entryQuantity = 10;
    const fields: string[] = [];
    const values: string[] = [];
    for (let i = 0; i < entryQuantity; i++) {
        const randomGeneratorValue = chance.integer({ min: 1, max: 50 });
        fields.push(chance.word({ length: randomGeneratorValue }));
        values.push(chance.word({ length: randomGeneratorValue }));
    }
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    await t.click(browserPage.addNewStreamEntry);
    // Filled Stream by new several Fields
    await browserPage.fulfillSeveralStreamFields(fields, values);
    await t.click(browserPage.saveElementButton);
    // Check that all data is saved in Stream
    for (let i = 0; i < fields.length; i++) {
        await t.expect(browserPage.streamEntriesContainer.find('span').withExactText(fields[i]).exists).ok('Added Field');
        await t.expect(browserPage.streamFieldsValues.find('span').withExactText(values[i]).exists).ok('Added Value');
    }
    // Check Stream length
    const streamLength = await browserPage.getKeyLength();
    await t.expect(streamLength).eql('2', 'Stream length after adding new entry');
});
