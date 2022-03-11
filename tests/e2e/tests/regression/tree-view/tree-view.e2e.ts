import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const browserPage = new BrowserPage();

fixture `Tree view verifications`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .afterEach(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneBigConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    .before(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .after(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can see message "No keys to display." when there are no keys in the database', async t => {
        //Verify the message
        await t.click(browserPage.treeViewButton);
        await t.expect(browserPage.keyListTable.textContent).contains('No keys to display.', 'The message is displayed');
    });
//skipped due the issue
test.skip
    .meta({ rte: rte.standalone })
    ('Verify that user can see the total number of keys, the number of keys scanned, the “Scan more” control displayed at the top of Tree view and Browser view', async t => {
        //Verify the controls on the Browser view
        await t.expect(browserPage.totalKeysNumber.visible).ok('The total number of keys is displayed on the Browser view');
        await t.expect(browserPage.scannedValue.visible).ok('The number of keys scanned is displayed on the Browser view');
        await t.expect(browserPage.scanMoreButton.visible).ok('The scan more button is displayed on the Browser view');
        //Verify the controls on the Tree view
        await t.click(browserPage.treeViewButton);
        await t.expect(browserPage.totalKeysNumber.visible).ok('The total number of keys is displayed on the Tree view');
        await t.expect(browserPage.scannedValue.visible).ok('The number of keys scanned is displayed on the Tree view');
        await t.expect(browserPage.scanMoreButton.visible).ok('The scan more button is displayed on the Tree view');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that when user deletes the key he can see the key is removed from the folder, the number of keys is reduced, the percentage is recalculated', async t => {
        //Open the first key in the tree view and remove
        await t.click(browserPage.treeViewButton);
        await t.click(browserPage.treeViewDeviceFolder);
        const numberOfKeys = await browserPage.treeViewDeviceKyesCount.textContent;
        const keyFolder = await browserPage.treeViewDeviceFolder.nth(2).textContent;
        await t.click(browserPage.treeViewDeviceFolder.nth(2));
        await t.click(browserPage.treeViewDeviceFolder.nth(5));
        await browserPage.deleteKey();
        //Verify the results
        await t.expect(browserPage.treeViewDeviceFolder.nth(2).textContent).notEql(keyFolder, 'The key folder is removed from the tree view');
        await t.expect(browserPage.treeViewDeviceKyesCount.textContent).notEql(numberOfKeys, 'The number of keys is recalculated');
    });
