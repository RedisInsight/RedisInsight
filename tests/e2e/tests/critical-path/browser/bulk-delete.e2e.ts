import { KeyTypesTexts, rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, BulkActionsPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { addHashKeyApi, addStreamKeyApi, deleteKeysApi } from '../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const bulkActionsPage = new BulkActionsPage();
const common = new Common();
const cliPage = new CliPage();

const field = common.generateWord(20);
const value = common.generateSentence(200);
const value1 = common.generateWord(20);
const keyNames = [common.generateWord(20), common.generateWord(20), common.generateWord(20), common.generateWord(20), common.generateWord(20)];
const hashKeyParameters = { keyName: keyNames[0], fields: [{ field, value: value1 }, { field, value }] };
const streamKeyParameters = { keyName: keyNames[1], entries: [{ id: '*', fields: [[field, value], [field, value1]] }] };
let keys1: string[];
let keys2: string[];

fixture `Bulk Delete`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await addHashKeyApi(hashKeyParameters, ossStandaloneConfig);
        await addStreamKeyApi(streamKeyParameters, ossStandaloneConfig);
    })
    .afterEach(async () => {
        //Clear and delete database
        await deleteKeysApi(keyNames, ossStandaloneConfig);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can access the bulk actions screen by clicking on the “Bulk Actions” button in the Browser', async t => {
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await t.click(browserPage.bulkActionsButton);
    await t.expect(bulkActionsPage.bulkActionsContainer.visible).ok('Bulk actions screen not opened');
});
test('Verify that user can see pattern summary of the keys selected: key type, pattern', async t => {
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await t.click(browserPage.bulkActionsButton);
    await t.expect(bulkActionsPage.infoFilter.innerText).contains('Key type:\nHASH', 'Key type is not correct');
    await t.expect(bulkActionsPage.infoSearch.innerText).contains('Pattern: *', 'Key pattern is not correct');
});
test('Verify that user can see no pattern selected message when no key type and pattern applied for Bulk Delete', async t => {
    await t.click(browserPage.bulkActionsButton);
    await t.expect(bulkActionsPage.bulkActionsPlaceholder.textContent).contains('No pattern or key type set', 'No pattern title not displayed');
    await t.expect(bulkActionsPage.bulkActionsPlaceholder.textContent).contains('To perform a bulk action, set the pattern or select the key type', 'No pattern message not displayed');
});
test
.after(async () => {
    //Clear and delete database
    await cliPage.sendCommandInCli(`DEL ${keys2.join(' ')}`);
    await deleteKeysApi(keyNames, ossStandaloneConfig);
    await deleteStandaloneDatabaseApi(ossStandaloneConfig);
})('Verify that user can see summary of scanned level: % of total keys scanned, # of keys scanned / total # of keys in the database, # of keys matching the filter, prediction of # of keys matching the filter in the entire database', async t => {
    //Add 10000 keys
    keys2 = await common.createArrayWithKeyValue(10000);
    await cliPage.sendCliCommandAndWaitForTotalKeys(`MSET ${keys2.join(' ')}`);
    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    await t.click(browserPage.bulkActionsButton);
    // await t.expect(bulkActionsPage.bulkActionsSummary.innerText).contains('Expected amount: ~10 002 keys', 'Bulk actions summary is not correct');
    await t.expect(bulkActionsPage.bulkDeleteSummary.innerText).contains('Scanned 5% (500/10 002) and found 500 keys', 'Bulk delete summary is not correct');
});
test('Verify that user can hover over info icon in Bulk Delete preview and see info about accuracy of the calculation', async t => {
    const tooltipText = 'Expected amount is estimated based on the number of keys scanned and the scan percentage. The final number may be different.';
    
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await t.click(browserPage.bulkActionsButton);
    await t.hover(bulkActionsPage.bulkDeleteTooltip);
    await t.expect(browserPage.tooltip.textContent).eql(tooltipText, 'Tooltip is not displayed or text is invalid');
});
test('Verify that user can see warning message clickling on Delete button for Bulk Deletion', async t => {
    const warningTooltipHeader = 'Are you sure you want to perform this action?';
    const warningTooltipMessage = 'All keys with HASH key type and selected pattern will be deleted.';

    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await t.click(browserPage.bulkActionsButton);
    await t.click(bulkActionsPage.deleteButton);
    await t.expect(bulkActionsPage.bulkActionWarningTooltip.textContent).contains(warningTooltipHeader, 'Warning Tooltip is not displayed or text is invalid');
    await t.expect(bulkActionsPage.bulkActionWarningTooltip.textContent).contains(warningTooltipMessage, 'Warning Tooltip is not displayed or text is invalid');
    await t.expect(bulkActionsPage.bulkApplyButton.visible).ok('Confirm deletion button not displayed');
});
test
.after(async () => {
    //Clear and delete database
    await cliPage.sendCommandInCli(`DEL ${keys2.join(' ')}`);
    await deleteKeysApi(keyNames, ossStandaloneConfig);
    await deleteStandaloneDatabaseApi(ossStandaloneConfig);
})('Verify that user can see blue progress line during the process of bulk deletion', async t => {
    //Add 10000 keys
    keys2 = await common.createArrayWithKeyValue(10000);
    await cliPage.sendCliCommandAndWaitForTotalKeys(`MSET ${keys2.join(' ')}`);
    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.progressLine.visible).ok('Blue progress line not displayed');
    await t.expect(bulkActionsPage.bulkStatusInProgress.visible).ok('Progress value not displayed');
});
test
.after(async () => {
    //Clear and delete database
    await cliPage.sendCommandInCli(`DEL ${keys2.join(' ')}`);
    await deleteKeysApi(keyNames, ossStandaloneConfig);
    await deleteStandaloneDatabaseApi(ossStandaloneConfig);
})('Verify that when user stops bulk deletion, operation is stopped', async t => {
    //Add 10000 keys
    keys2 = await common.createArrayWithKeyValue(10000);
    await cliPage.sendCliCommandAndWaitForTotalKeys(`MSET ${keys2.join(' ')}`);
    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    await bulkActionsPage.startBulkDelete();
    await t.click(bulkActionsPage.bulkStopButton);
    const stoppedProgress = Number((await bulkActionsPage.bulkStatusStopped.innerText).slice(-1, -3));
    await t.expect(bulkActionsPage.bulkStatusStopped.visible).ok('Progress value not displayed');
    // Verify that when user stop bulk deletion, he can see the percentage at which the operation was stopped
    await t.expect(stoppedProgress).gt(1, 'Progress value not displayed');
    await t.expect(stoppedProgress).lt(100, 'Progress value not correct');
});
test('Verify that when bulk deletion is completed, status Action completed is displayed', async t => {
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.bulkStatusCompleted.visible).ok('Bulk deletion not completed', {timeout: 15000});
    await t.expect(bulkActionsPage.bulkStatusCompleted.textContent).eql('Action completed', 'Action completed text is not visible');
    // Verify that when bulk deletion is completed, button Delete changes to Start New
    await t.expect(bulkActionsPage.bulkStartAgainButton.visible).ok('"Start New" button not displayed');
    // Verify that user can click on Start New and existed filter will be applied
    await t.click(bulkActionsPage.bulkStartAgainButton);
    await t.expect(bulkActionsPage.bulkDeleteSummary.innerText).contains('Scanned 5% (500/10 002) and found 500 keys', 'Bulk delete summary is not correct');
});
test
.after(async () => {
    //Clear and delete database
    await cliPage.sendCommandInCli(`DEL ${keys2.join(' ')}`);
    await deleteKeysApi(keyNames, ossStandaloneConfig);
    await deleteStandaloneDatabaseApi(ossStandaloneConfig);
})('Verify that after finishing bulk deletion user can see # of processed keys, # of deleted keys, # of errors, execution time', async t => {
    //Add 10000 keys
    keys2 = await common.createArrayWithKeyValue(10000);
    await cliPage.sendCliCommandAndWaitForTotalKeys(`MSET ${keys2.join(' ')}`);
    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.innerText).contains('10 000 Keys Processed', 'Bulk delete completed summary not correct');
    await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.innerText).contains('10 000 Success', 'Bulk delete completed summary not correct');
    await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.innerText).contains('0 Errors', 'Bulk delete completed summary not correct');
    await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.innerText).notContains('0:00:00', 'Bulk delete completed summary not correct');
});
test('Verify that after bulk deletion is completed, user can start new bulk delete', async t => {
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.bulkStartAgainButton.visible).ok('"Start New" button not displayed');
    await t.click(bulkActionsPage.bulkStartAgainButton);
    await browserPage.selectFilterGroupType(KeyTypesTexts.Stream);
    await t.expect(bulkActionsPage.infoFilter.innerText).contains('Key type:\nSTREAM', 'Key type is not correct');
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.bulkStatusCompleted.textContent).eql('Action completed', 'Action completed text is not visible');
});
test('Verify that when user clicks on Close button when bulk delete is completed, panel is closed, no context is saved', async t => {
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.innerText).contains('1 Keys Processed', 'Bulk delete completed summary not correct');
    await t.click(bulkActionsPage.bulkCancelButton);
    await t.click(browserPage.bulkActionsButton);
    // Verify context not saved
    await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.innerText).notContains('1 Keys Processed', 'Bulk delete completed summary not correct');
    await t.expect(bulkActionsPage.bulkDeleteSummary.innerText).contains('Scanned 100% (2/2) and found 1 keys', 'Bulk delete summary is not correct');
});
test('Verify that when user clicks on cross icon when bulk delete is completed, panel is closed, no context is saved', async t => {
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.innerText).contains('1 Keys Processed', 'Bulk delete completed summary not correct');
    await t.click(bulkActionsPage.bulkClosePanelButton);
    await t.click(browserPage.bulkActionsButton);
    // Verify context not saved
    await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.innerText).notContains('1 Keys Processed', 'Bulk delete completed summary not correct');
    await t.expect(bulkActionsPage.bulkDeleteSummary.innerText).contains('Scanned 100% (2/2) and found 1 keys', 'Bulk delete summary is not correct');
});
