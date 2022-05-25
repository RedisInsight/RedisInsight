import { Chance } from 'chance';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { rte } from '../../../helpers/constants';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const chance = new Chance();

const value = chance.word({length: 5});
let field = chance.word({length: 5});
let keyName = chance.word({length: 20});

fixture `Stream key`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that user can see a Stream in a table format', async t => {
    const streamFields = [
        'Entry ID',
        field
    ];
    keyName = chance.word({length: 20});
    const command = `XADD ${keyName} * '${field}' '${value}'`;
    //Add new Stream key with 5 EntryIds
    for(let i = 0; i < 5; i++){
        await cliPage.sendCommandInCli(command);
    }
    //Open key details and check Steam format
    await browserPage.openKeyDetails(keyName);
    await t.expect(browserPage.virtualTableContainer.visible).ok('The Stream is displayed in a table format');
    for(const field of streamFields){
        await t.expect(browserPage.streamEntriesContainer.textContent).contains(field, 'The Stream fields are in the table');
    }
    await t.expect(browserPage.streamFieldsValues.textContent).contains(value, 'The Stream field value is in the table');
});
test('Verify that user can sort ASC/DESC by Entry ID', async t => {
    keyName = chance.word({length: 20});
    const command = `XADD ${keyName} * '${field}' '${value}'`;
    //Add new Stream key with 5 EntryIds
    for(let i = 0; i < 5; i++){
        await cliPage.sendCommandInCli(command);
    }
    //Open key details and check Entry ID ASC sorting
    await browserPage.openKeyDetails(keyName);
    const entryCount = await browserPage.streamEntryDate.count;
    for(let i = 0; i < entryCount - 1; i++){
        const entryDateFirstAsc = Date.parse(await browserPage.streamEntryDate.nth(i).textContent);
        const entryDateSecondAsc = Date.parse(await browserPage.streamEntryDate.nth(i + 1).textContent);
        await t.expect(entryDateFirstAsc).gt(entryDateSecondAsc, 'By default the table is sorted by Entry ID');
    }
    //Check the DESC sorting
    await t.click(browserPage.scoreButton);
    for(let i = 0; i < entryCount - 1; i++){
        const entryDateFirstDesc = Date.parse(await browserPage.streamEntryDate.nth(i).textContent);
        const entryDateSecondDesc = Date.parse(await browserPage.streamEntryDate.nth(i + 1).textContent);
        await t.expect(entryDateFirstDesc).lt(entryDateSecondDesc, 'The Stream fields are sorted DESC by Entry ID');
    }
});
test('Verify that user can see all the columns are displayed by default for Stream', async t => {
    keyName = chance.word({length: 20});
    const fields = [
        'Pressure',
        'Humidity',
        'Temperature'
    ];
    const values = [
        '234',
        '78',
        '27'
    ];
    //Add new Stream key with 3 fields
    for(let i = 0; i < fields.length; i++){
        await cliPage.sendCommandInCli(`XADD ${keyName} * ${fields[i]} ${values[i]}`);
    }
    //Open key details and check fields
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.fullScreenModeButton);
    for(let i = fields.length - 1; i <= 0; i--){
        const fieldName = await browserPage.streamFields.nth(i).textContent;
        await t.expect(fieldName).eql(fields[i], 'All the columns are displayed by default for Stream');
    }
    await t.click(browserPage.fullScreenModeButton);
});
test('Verify that the multi-line cell value tooltip is available on hover as per standard key details behavior', async t => {
    keyName = chance.word({length: 20});
    const fields = [
        'Pressure',
        'Humidity'
    ];
    const entryValue = chance.sentence({words: 5});
    //Add new Stream key with multi-line cell value
    for(let i = 0; i < fields.length; i++){
        await cliPage.sendCommandInCli(`XADD ${keyName} * '${fields[i]}' '${entryValue}'`);
    }
    //Open key details and check tooltip
    await browserPage.openKeyDetails(keyName);
    await t.hover(browserPage.streamEntryFields);
    await t.expect(browserPage.tooltip.textContent).contains(entryValue, 'The multi-line cell value tooltip is available');
});
test('Verify that user can see a confirmation message when request to delete an entry in the Stream', async t => {
    keyName = chance.word({length: 20});
    field = 'fieldForRemoving';
    const confirmationMessage = `will be removed from ${keyName}`;
    //Add new Stream key with 1 field
    await cliPage.sendCommandInCli(`XADD ${keyName} * ${field} ${value}`);
    //Open key details and click on delete entry
    await browserPage.openKeyDetails(keyName);
    const entryId = await browserPage.streamEntryIdValue.textContent;
    await t.click(browserPage.removeEntryButton);
    //Check the confirmation message
    await t.expect(browserPage.confirmationMessagePopover.textContent).contains(confirmationMessage, `The confirmation message ${keyName}`);
    await t.expect(browserPage.confirmationMessagePopover.textContent).contains(entryId, `The confirmation message for removing Entry`);
});
