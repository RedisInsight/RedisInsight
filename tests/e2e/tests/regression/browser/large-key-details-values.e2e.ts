import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import {
    addHashKeyApi,
    addListKeyApi,
    addSetKeyApi,
    addSortedSetKeyApi,
    addStreamKeyApi,
    deleteKeysApi
} from '../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const common = new Common();

const field = common.generateWord(20);
const value = common.generateSentence(200);
const value1 = common.generateWord(20);
const keyNames = [common.generateWord(20), common.generateWord(20), common.generateWord(20), common.generateWord(20), common.generateWord(20)];
const hashKeyParameters = { keyName: keyNames[0], fields: [{ field, value: value1 }, { field, value }] };
const streamKeyParameters = { keyName: keyNames[1], entries: [{ id: '*', fields: [[field, value], [field, value1]] }] };
const setKeyParameters = { keyName: keyNames[2], members: [value] };
const sortedSetKeyParameters = { keyName: keyNames[3], members: [{ name: value, score: '1' }] };
const listKeyParameters = { keyName: keyNames[4], element: value };

fixture `Expand/Collapse large values in key details`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await addHashKeyApi(hashKeyParameters, ossStandaloneConfig);
        await addStreamKeyApi(streamKeyParameters, ossStandaloneConfig);
        await addSetKeyApi(setKeyParameters, ossStandaloneConfig);
        await addSortedSetKeyApi(sortedSetKeyParameters, ossStandaloneConfig);
        await addListKeyApi(listKeyParameters, ossStandaloneConfig);
    })
    .afterEach(async() => {
        //Delete database
        await deleteKeysApi(keyNames, ossStandaloneConfig);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can click on a row to expand it if any of its cells contains a value which is truncated.', async t => {
    const entryFieldLong = browserPage.streamEntryFields.nth(1).parent(1);
    const entryFieldSmall = browserPage.streamEntryFields.nth(0).parent(1);
    // Open Stream key details
    await browserPage.openKeyDetails(keyNames[1]);
    // Remember height of the cells
    const startLongCellHeight = await entryFieldLong.clientHeight;
    const startSmallCellHeight = await entryFieldSmall.clientHeight;
    await t.click(entryFieldSmall);
    // Verify that field with small text is not expanded
    await t.expect(entryFieldSmall.clientHeight).lt(startSmallCellHeight + 5, 'Row is expanded', { timeout: 5000 });
    // Verify that user can expand/collapse for stream data type
    await t.click(entryFieldLong);
    await t.expect(entryFieldLong.clientHeight).gt(startLongCellHeight + 150, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse the row by clicking anywhere on the expanded row
    await t.click(entryFieldLong);
    await t.expect(entryFieldLong.clientHeight).eql(startLongCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
test('Verify that user can expand/collapse for hash data type', async t => {
    const fieldValueCell = browserPage.hashFieldValue.parent(2);
    // Open Hash key details
    await browserPage.openKeyDetails(keyNames[0]);
    // Remember height of the cell with long value
    const startCellHeight = await fieldValueCell.clientHeight;
    // Verify that user can expand a row of hash data type
    await t.click(fieldValueCell);
    await t.expect(fieldValueCell.clientHeight).gt(startCellHeight + 150, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse a row of hash data type
    await t.click(fieldValueCell);
    await t.expect(fieldValueCell.clientHeight).eql(startCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
test('Verify that user can expand/collapse for set data type', async t => {
    const memberValueCell = browserPage.setMembersList.parent(2);
    // Open Set key details
    await browserPage.openKeyDetails(keyNames[2]);
    // Remember height of the cell with long value
    const startLongCellHeight = await memberValueCell.clientHeight;
    // Verify that user can expand a row of set data type
    await t.click(memberValueCell);
    await t.expect(memberValueCell.clientHeight).gt(startLongCellHeight + 150, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse a row of set data type
    await t.click(memberValueCell);
    await t.expect(memberValueCell.clientHeight).eql(startLongCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
test('Verify that user can expand/collapse for sorted set data type', async t => {
    const memberValueCell = browserPage.zsetMembersList.parent(1);
    // Open Sorted Set key details
    await browserPage.openKeyDetails(keyNames[3]);
    // Remember height of the cell with long value
    const startLongCellHeight = await memberValueCell.clientHeight;
    // Verify that user can expand a row of sorted set data type
    await t.click(memberValueCell);
    await t.expect(memberValueCell.clientHeight).gt(startLongCellHeight + 150, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse a row of sorted set data type
    await t.click(memberValueCell);
    await t.expect(memberValueCell.clientHeight).eql(startLongCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
test('Verify that user can expand/collapse for list data type', async t => {
    const elementValueCell = browserPage.listElementsList.parent(2);
    // Open List key details
    await browserPage.openKeyDetails(keyNames[4]);
    // Remember height of the cell with long value
    const startLongCellHeight = await elementValueCell.clientHeight;
    // Verify that user can expand a row of list data type
    await t.click(elementValueCell);
    await t.expect(elementValueCell.clientHeight).gt(startLongCellHeight + 150, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse a row of list data type
    await t.click(elementValueCell);
    await t.expect(elementValueCell.clientHeight).eql(startLongCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
test('Verify that user can work in full mode with expanded/collapsed value', async t => {
    const elementValueCell = browserPage.listElementsList.parent(2);
    // Open List key details
    await browserPage.openKeyDetails(keyNames[4]);
    // Open full mode for key details
    await t.click(browserPage.fullScreenModeButton);
    // Remember height of the cell with long value
    const startLongCellHeight = await elementValueCell.clientHeight;
    // Verify that user can expand a row in full mode
    await t.click(elementValueCell);
    await t.expect(elementValueCell.clientHeight).gt(startLongCellHeight + 60, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse a row in full mode
    await t.click(elementValueCell);
    await t.expect(elementValueCell.clientHeight).eql(startLongCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
