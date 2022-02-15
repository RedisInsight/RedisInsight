import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig
} from '../../../helpers/conf';
import { rte, KeyTypesTexts } from '../../../helpers/constants';

const browserPage = new BrowserPage();

//skipped due the functionality is not yet done
fixture.skip `Tree view verifications`
    .meta({type: 'critical_path'})
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
    ('Verify that when user opens the application he can see that Tree View is disabled by default(Browser is selected by default)', async t => {
        //Verify that Browser view is selected by default and Tree view is disabled
        await t.expect(browserPage.browserViewButton.withAttribute('active', 'true')).ok('The Browser is selected by default');
        await t.expect(browserPage.treeViewArea.visible).notOk('The tree view is not displayed');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see that "Tree view" mode is enabled state is saved when refreshes the page', async t => {
        await t.click(browserPage.treeViewButton);
        await t.eval(() => location.reload());
        //Verify that "Tree view" mode enabled state is saved
        await t.expect(browserPage.treeViewArea.visible).notOk('The tree view is not displayed');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see DB is automatically scanned by 10K keys in the background, user can see the number of keys scanned and use the "Scan More" button to search per another 10000 keys', async t => {
        await t.click(browserPage.treeViewButton);
        //Verify the scanned value
        await t.expect(browserPage.treeViewScannedValue.textContent).contains('Scanned 10 000', 'The database is automatically scanned by 10K keys');
        //Verify that user can use the "Scan More" button to search per another 10000 keys
        await t.click(browserPage.scanMoreButton);
        await t.expect(browserPage.treeViewScannedValue.textContent).contains('Scanned 20 000', 'The database is automatically scanned by 10K keys');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see that “:” (colon) used as a default separator for namespaces', async t => {
        await t.click(browserPage.treeViewButton);
        //Verify the default separator
        await t.expect(browserPage.treeViewSeparator.visible).ok('The “:” (colon) used as a default separator for namespaces');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see the number of keys found per each namespace', async t => {
        await t.click(browserPage.treeViewButton);
        //Verify the number of keys found
        await t.expect(browserPage.treeViewKeysNumber.visible).ok('The user can see the number of keys');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that when user enables filtering by key name he can see only folder with appropriate keys are displayed and the number of keys and percentage is recalculated', async t => {
        const keyNameFilter = 'key';
        const numberOfKeys = await browserPage.treeViewKeysNumber.textContent;
        const percentage = await browserPage.treeViewPercentage.textContent;
        await t.click(browserPage.treeViewButton);
        //Set filter by key name
        await browserPage.searchByKeyName(keyNameFilter);
        //Verify the results
        await t.expect(browserPage.treeViewFolders.textContent).contains(keyNameFilter, 'The appropriate keys are displayed');
        await t.expect(browserPage.treeViewKeysNumber.textContent).notEql(numberOfKeys, 'The number of keys is recalculated');
        await t.expect(browserPage.treeViewPercentage.textContent).notEql(percentage, 'The percentage is recalculated');
    });
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneBigConfig.databaseName);
    })
    ('Verify that when user switched from Tree View to Browser and goes back state of filer by key name/key type is saved', async t => {
        const keyName = 'keyName';
        await t.click(browserPage.treeViewButton);
        await browserPage.searchByKeyName(keyName);
        await t.click(browserPage.browserViewButton);
        await t.click(browserPage.treeViewButton);
        //Verify that state of filer by key name is saved
        await t.expect(browserPage.searchInput.textContent).eql(keyName, 'The state of filer by key name is saved');
        await t.click(browserPage.treeViewButton);
        //Set filter by key type
        await browserPage.selectFilterGroupType(KeyTypesTexts.String); 
        await t.click(browserPage.browserViewButton);
        await t.click(browserPage.treeViewButton);
        //Verify that state of filer by key type is saved
        await t.expect(await browserPage.selectedFilterTypeString.visible).eql(true, 'Filter per key type is still applied');
    });
