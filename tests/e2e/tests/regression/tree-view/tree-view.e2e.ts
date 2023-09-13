import { DatabaseHelper } from '../../../helpers/database';
import { BrowserPage, WorkbenchPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneRedisearch
} from '../../../helpers/conf';
import { KeyTypesTexts, rte } from '../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const workbenchPage = new WorkbenchPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture `Tree view verifications`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch);
    })
    .after(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneRedisearch);
    })('Verify that user can see message "No keys to display." when there are no keys in the database', async t => {
        const message = 'No Keys Found\nCreate your first key to get started\nKeys are the foundation of Redis. Create your first key to start exploring Redis and Redis Stack capabilities';

        // Verify the message
        await t.click(browserPage.treeViewButton);
        await t.expect(browserPage.keyListMessage.innerText).contains(message, 'The message is not displayed');
        await t.expect(browserPage.guideLinksBtn.count).gte(5);
        await browserPage.clickGuideLinksByName('JSON');
        await t.expect(workbenchPage.expandArea.visible).ok('Workbench page is not opened');
    });
test('Verify that user can see the total number of keys, the number of keys scanned, the “Scan more” control displayed at the top of Tree view and Browser view', async t => {
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    // Verify the controls on the Browser view
    await t.expect(browserPage.totalKeysNumber.visible).ok('The total number of keys is not displayed on the Browser view');
    await t.expect(browserPage.scannedValue.visible).ok('The number of keys scanned is not displayed on the Browser view');
    await t.expect(browserPage.scanMoreButton.visible).ok('The scan more button is not displayed on the Browser view');
    // Verify the controls on the Tree view
    await t.click(browserPage.treeViewButton);
    await t.expect(browserPage.totalKeysNumber.visible).ok('The total number of keys is not displayed on the Tree view');
    await t.expect(browserPage.scannedValue.visible).ok('The number of keys scanned is not displayed on the Tree view');
    await t.expect(browserPage.scanMoreButton.visible).ok('The scan more button is not displayed on the Tree view');
});
test('Verify that when user deletes the key he can see the key is removed from the folder, the number of keys is reduced, the percentage is recalculated', async t => {
    // Open the first key in the tree view and remove
    await t.click(browserPage.treeViewButton);

    // Verify the default separator
    await t.expect(browserPage.treeViewSeparator.textContent).eql(':', 'The “:” (colon) not used as a default separator for namespaces');
    // Verify that user can see that “:” (colon) used as a default separator for namespaces and see the number of keys found per each namespace
    await t.expect(browserPage.treeViewKeysNumber.visible).ok('The user can not see the number of keys');

    await t.expect(browserPage.treeViewDeviceFolder.visible).ok('The key folder is not displayed', { timeout: 30000 });
    await t.click(browserPage.treeViewDeviceFolder);
    const numberOfKeys = await browserPage.treeViewDeviceKyesCount.textContent;
    const keyFolder = await browserPage.treeViewDeviceFolder.nth(2).textContent;
    await t.click(browserPage.treeViewDeviceFolder.nth(2));
    await t.click(browserPage.treeViewDeviceFolder.nth(5));
    await browserPage.deleteKey();
    // Verify the results
    await t.expect(browserPage.treeViewDeviceFolder.nth(2).exists).notOk('The previous folder is not closed after removing key folder');
    await t.click(browserPage.treeViewDeviceFolder);
    await t.expect(browserPage.treeViewDeviceFolder.nth(2).textContent).notEql(keyFolder, 'The key folder is not removed from the tree view');
    await t.expect(browserPage.treeViewDeviceKyesCount.textContent).notEql(numberOfKeys, 'The number of keys is not recalculated');
});
