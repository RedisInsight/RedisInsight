import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage,
    SettingsPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const settingsPage = new SettingsPage();
const cliPage = new CliPage();
const common = new Common();

const explicitErrorHandler = (): void => {
    window.addEventListener('error', e => {
        if(e.message === 'ResizeObserver loop limit exceeded') {
            e.stopImmediatePropagation();
        }
    })
}

fixture `Browser - Specify Keys to Scan`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .clientScripts({ content: `(${explicitErrorHandler.toString()})()` })
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async(t) => {
        //Clear database
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that the user can see this number of keys applied to new filter requests and to "scan more" functionality in Browser page', async t => {
        const searchPattern = 'key[12]*';
        //Go to Settings page
        await t.click(myRedisDatabasePage.settingsButton);
        //Specify keys to scan
        await t.click(settingsPage.accordionAdvancedSettings);
        await settingsPage.changeKeysToScanValue('1000');
        // Go to Browser Page
        await t.click(myRedisDatabasePage.myRedisDBButton);
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Create new keys
        const arr = await common.createArrayWithKeyValue(2500);
        await t.typeText(cliPage.cliCommandInput, `MSET ${arr.join(' ')}`, {paste: true});
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
        //Search keys
        await browserPage.searchByKeyName(searchPattern);
        const keysNumberOfScanned = await browserPage.keysNumberOfScanned.textContent;
        //Verify that number of scanned is 1000
        await t.expect(keysNumberOfScanned).contains('1 000', 'Number of scanned is 1000');
        //Scan more
        await t.click(browserPage.scanMoreButton);
        const keysNumberOfScannedScanMore = await browserPage.keysNumberOfScanned.textContent;
        //Verify that number of results is 2000
        await t.expect(keysNumberOfScannedScanMore).contains('2 000', 'Number of scanned is 2000');
    });

