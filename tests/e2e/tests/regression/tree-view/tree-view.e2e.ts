import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });

//skipped due the functionality is not yet done
fixture.skip `Tree view verifications`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneBigConfig, ossStandaloneConfig.databaseName);
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
        await t.expect(browserPage.treeViewMessage.textContent).eql('No keys to display.', 'The message is displayed');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see the total number of keys, the number of keys scanned, the “Scan more” control displayed at the top of Tree view and Browser view', async t => {
        //Verify the controls on the Browser view
        await t.expect(browserPage.totalKeysNumber.visible).ok('The total number of keys is displayed on the Browser view');
        await t.expect(browserPage.keysScanned.visible).ok('The number of keys scanned is displayed on the Browser view');
        await t.expect(browserPage.scanMoreButton.visible).ok('The scan more button is displayed on the Browser view');
        //Verify the controls on the Tree view
        await t.click(browserPage.treeViewButton);
        await t.expect(browserPage.totalKeysNumber.visible).ok('The total number of keys is displayed on the Tree view');
        await t.expect(browserPage.keysScanned.visible).ok('The number of keys scanned is displayed on the Tree view');
        await t.expect(browserPage.scanMoreButton.visible).ok('The scan more button is displayed on the Tree view');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that when user deletes the key he can see the key is removed from the folder, the number of keys is reduced, the percentage is recalculated', async t => {
        //Add new key for deletion
        await browserPage.addHashKey(keyName);
        await t.click(browserPage.treeViewArea);
        const numberOfKeys = await browserPage.treeViewKeysNumber.textContent;
        const percentage = await browserPage.treeViewPercentage.textContent;
        //Delete key
        await browserPage.searchByKeyName(keyName);
        //Verify the results
        await t.expect(browserPage.treeViewFolders.textContent).notContains(keyName, 'The key is removed from the folder');
        await t.expect(browserPage.treeViewKeysNumber.textContent).notEql(numberOfKeys, 'The number of keys is recalculated');
        await t.expect(browserPage.treeViewPercentage.textContent).notEql(percentage, 'The percentage is recalculated');
    });
