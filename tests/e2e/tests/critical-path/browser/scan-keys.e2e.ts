import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    CliPage,
    SettingsPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const settingsPage = new SettingsPage();
const cliPage = new CliPage();
const common = new Common();

let keys = [];

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
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await cliPage.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
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
        keys = await common.createArrayWithKeyValue(2500);
        await t.typeText(cliPage.cliCommandInput, `MSET ${keys.join(' ')}`, {paste: true});
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
