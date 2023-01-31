import { KeyTypesTexts, rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, BulkActionsPage, MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossStandaloneRedisearch } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { addHashKeyApi, addSetKeyApi } from '../../../helpers/api/api-keys';
import { deleteAllKeysFromDB, populateDBWithHashes } from '../../../helpers/keys';

const browserPage = new BrowserPage();
const bulkActionsPage = new BulkActionsPage();
const common = new Common();
const myRedisDatabasePage = new MyRedisDatabasePage();

const keyNames = [common.generateWord(20), common.generateWord(20)];
const hashKeyParameters = { keyName: keyNames[0], fields: [{ field: common.generateWord(20), value: common.generateWord(20) }] };
const setKeyParameters = { keyName: keyNames[1], members: [common.generateWord(20)] };
const dbParameters = { host: ossStandaloneRedisearch.host, port: ossStandaloneRedisearch.port };
const keyToAddParameters = { keysCount: 10000, keyNameStartWith: 'hashKey'};
const keyToAddParameters2 = { keysCount: 500000, keyNameStartWith: 'hashKey'};

fixture `Bulk Delete`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch, ossStandaloneRedisearch.databaseName);
        await addHashKeyApi(hashKeyParameters, ossStandaloneRedisearch);
        await addSetKeyApi(setKeyParameters, ossStandaloneRedisearch);
    })
    .afterEach(async() => {
        // Clear and delete database
        await deleteAllKeysFromDB(dbParameters.host, dbParameters.port);
        await deleteStandaloneDatabaseApi(ossStandaloneRedisearch);
    });
test('Verify that user can access the bulk actions screen in the Browser', async t => {
    // Filter by Hash keys
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    // Open bulk actions
    await t.click(browserPage.bulkActionsButton);
    await t.expect(bulkActionsPage.bulkActionsContainer.exists).ok('Bulk actions screen not opened');
    // Verify that user can see pattern summary of the keys selected: key type, pattern
    await t.expect(bulkActionsPage.infoFilter.innerText).contains('Key type:\nHASH', 'Key type is not correct');
    await t.expect(bulkActionsPage.infoSearch.innerText).contains('Pattern: *', 'Key pattern is not correct');
    // Verify that user can hover over info icon in Bulk Delete preview and see info about accuracy of the calculation
    const tooltipText = 'Expected amount is estimated based on the number of keys scanned and the scan percentage. The final number may be different.';
    await t.hover(bulkActionsPage.bulkDeleteTooltipIcon);
    await t.expect(browserPage.tooltip.textContent).eql(tooltipText, 'Tooltip is not displayed or text is invalid');
    // Verify that user can see warning message clicking on Delete button for Bulk Deletion
    const warningTooltipTitle = 'Are you sure you want to perform this action?';
    const warningTooltipMessage = 'All keys with HASH key type and selected pattern will be deleted.';
    await t.click(bulkActionsPage.deleteButton);
    await t.expect(bulkActionsPage.bulkActionWarningTooltip.textContent).contains(warningTooltipTitle, 'Warning Tooltip title is not displayed or text is invalid');
    await t.expect(bulkActionsPage.bulkActionWarningTooltip.textContent).contains(warningTooltipMessage, 'Warning Tooltip message is not displayed or text is invalid');
    await t.expect(bulkActionsPage.bulkApplyButton.exists).ok('Confirm deletion button not displayed');

});
test('Verify that user can see summary of scanned level', async t => {
    const expectedAmount = new RegExp('Expected amount: ~(9|10) \\d{3} keys');
    const scannedKeys = new RegExp('Scanned (5|10)% \\((500|1 000)/10 \\d{3}\\) and found \\d{3,5} keys');
    const messageTitle = 'No pattern or key type set';
    const messageText = 'To perform a bulk action, set the pattern or select the key type';

    // Add 10000 Hash keys
    await populateDBWithHashes(dbParameters.host, dbParameters.port, keyToAddParameters);
    // Open bulk actions
    await t.click(browserPage.bulkActionsButton);
    // Verify that user can see no pattern selected message when no key type and pattern applied for Bulk Delete
    await t.expect(bulkActionsPage.bulkActionsPlaceholder.textContent).contains(messageTitle, 'No pattern title not displayed');
    await t.expect(bulkActionsPage.bulkActionsPlaceholder.textContent).contains(messageText, 'No pattern message not displayed');
    // Filter by Hash keys
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    // Verify that prediction of # of keys matching the filter in the entire database displayed
    await t.expect(bulkActionsPage.bulkActionsSummary.textContent).match(expectedAmount, 'Bulk actions summary is not correct');
    // Verify that % of total keys scanned, # of keys scanned / total # of keys in the database, # of keys matching the filter displayed
    await t.expect(bulkActionsPage.bulkDeleteSummary.innerText).match(scannedKeys, 'Bulk delete summary is not correct');

});
test('Verify that user can see blue progress line during the process of bulk deletion', async t => {
    // Add 500000 Hash keys
    await populateDBWithHashes(dbParameters.host, dbParameters.port, keyToAddParameters2);
    // Filter and search by Hash keys added
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await browserPage.searchByKeyName('hashKey*');
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.progressLine.exists).ok('Blue progress line not displayed', { timeout: 5000 });
    await t.expect(bulkActionsPage.bulkStatusInProgress.exists).ok('Progress value not displayed', { timeout: 5000 });
});
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch, ossStandaloneRedisearch.databaseName);
        // Add 1000000 Hash keys
        await populateDBWithHashes(dbParameters.host, dbParameters.port, keyToAddParameters2);
        await populateDBWithHashes(dbParameters.host, dbParameters.port, keyToAddParameters2);
        // Filter and search by Hash keys added
        await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
        await browserPage.searchByKeyName('hashKey*');
    })('Verify that bulk deletion is still run when user goes to any ather page in the application inside of this DB', async t => {
        await bulkActionsPage.startBulkDelete();
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
        // Go to Browser Page
        await t.click(myRedisDatabasePage.browserButton);
        await t.expect(bulkActionsPage.bulkStatusInProgress.exists).ok('Progress value not displayed', { timeout: 5000 });
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch, ossStandaloneRedisearch.databaseName);
        // Add 500000 keys
        await populateDBWithHashes(dbParameters.host, dbParameters.port, keyToAddParameters2);
        // Filter and search by Hash keys added
        await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
        await browserPage.searchByKeyName('hashKey*');
    })('Verify that when user stops bulk deletion, operation is stopped', async t => {
        await bulkActionsPage.startBulkDelete();
        await t.click(bulkActionsPage.bulkStopButton);
        const stoppedProgress = parseInt((await bulkActionsPage.bulkStatusStopped.innerText).replace(/[^\d]/g, ''));
        await t.expect(bulkActionsPage.bulkStatusStopped.exists).ok('Progress value not displayed');
        // Verify that when user stop bulk deletion, he can see the percentage at which the operation was stopped
        await t.expect(stoppedProgress).gt(1, 'Progress value not displayed');
        await t.expect(stoppedProgress).lt(100, 'Progress value not correct');
    });
test('Verify that when bulk deletion is completed, status Action completed is displayed', async t => {
    // Filter by Hash keys
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.bulkStatusCompleted.exists).ok('Bulk deletion not completed', { timeout: 15000 });
    await t.expect(bulkActionsPage.bulkStatusCompleted.textContent).eql('Action completed', 'Action completed text is not visible');
    // Verify that when bulk deletion is completed, button Delete changes to Start New
    await t.expect(bulkActionsPage.bulkStartAgainButton.exists).ok('"Start New" button not displayed');
    // Verify that user can click on Start New and existed filter will be applied
    await t.click(bulkActionsPage.bulkStartAgainButton);
    await t.expect(bulkActionsPage.bulkDeleteSummary.innerText).contains('Scanned 100% (2/2) and found 1 keys', 'Bulk delete summary is not correct');
});
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch, ossStandaloneRedisearch.databaseName);
        await addSetKeyApi(setKeyParameters, ossStandaloneRedisearch);
        // Add 10000 Hash keys
        await populateDBWithHashes(dbParameters.host, dbParameters.port, keyToAddParameters);
        // Filter by Hash keys
        await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    })('Verify that after finishing bulk deletion user can see # of processed keys, # of deleted keys, # of errors, execution time', async t => {
        await bulkActionsPage.startBulkDelete();
        await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.textContent).contains('10 000Keys Processed', 'Bulk delete completed summary not correct');
        await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.textContent).contains('10 000Success', 'Bulk delete completed summary not correct');
        await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.textContent).contains('0Errors', 'Bulk delete completed summary not correct');
        await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.textContent).notContains('0:00:00.00', 'Bulk delete completed summary not correct');
    });
test('Verify that after bulk deletion is completed, user can start new bulk delete', async t => {
    // Filter by Hash keys
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await bulkActionsPage.startBulkDelete();
    await t.click(bulkActionsPage.bulkStartAgainButton);
    await browserPage.selectFilterGroupType(KeyTypesTexts.Stream);
    await t.expect(bulkActionsPage.infoFilter.innerText).contains('Key type:\nSTREAM', 'Key type is not correct');
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.bulkStatusCompleted.textContent).eql('Action completed', 'Action completed text is not visible');
});
test('Verify that when user clicks on Close button when bulk delete is completed, panel is closed, no context is saved', async t => {
    // Filter by Hash keys
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await bulkActionsPage.startBulkDelete();
    await t.click(bulkActionsPage.bulkCancelButton);
    await t.click(browserPage.bulkActionsButton);
    // Verify context not saved
    await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.exists).notOk('Bulk delete completed summary still displayed');
    await t.expect(bulkActionsPage.bulkDeleteSummary.textContent).contains('Scanned 100% (2/2) and found 1 keys', 'Bulk delete summary is not correct');
    // Verify that when user clicks on cross icon when bulk delete is completed, panel is closed, no context is saved
    await bulkActionsPage.startBulkDelete();
    await t.click(bulkActionsPage.bulkClosePanelButton);
    await t.click(browserPage.bulkActionsButton);
    // Verify context not saved
    await t.expect(bulkActionsPage.bulkDeleteCompletedSummary.exists).notOk('Bulk delete completed summary still displayed');
    await t.expect(bulkActionsPage.bulkDeleteSummary.textContent).contains('Scanned 100% (2/2) and found 1 keys', 'Bulk delete summary is not correct');
});
