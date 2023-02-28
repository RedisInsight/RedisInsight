import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    CliPage
} from '../../../pageObjects';
import { commonUrl, ossStandaloneBigConfig, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { KeyTypesTexts, rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { verifySearchFilterValue } from '../../../helpers/keys';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const cliPage = new CliPage();
const common = new Common();

const speed = 0.4;
let keyName = common.generateWord(10);
let keys: string[];

fixture `Browser Context`
    .meta({type: 'critical_path', rte: rte.standalone})
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
// Update after resolving https://redislabs.atlassian.net/browse/RI-3299
test('Verify that user can see saved CLI size on Browser page when he returns back to Browser page', async t => {
    const offsetY = 200;

    await t.click(cliPage.cliExpandButton);
    const cliAreaHeight = await cliPage.cliArea.clientHeight;
    const cliAreaHeightEnd = cliAreaHeight + 150;
    const cliResizeButton = cliPage.cliResizeButton;
    await t.hover(cliResizeButton);
    // move resize 200px up
    await t.drag(cliResizeButton, 0, -offsetY, { speed: 0.01 });
    await t.click(myRedisDatabasePage.myRedisDBButton);
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.expect(await cliPage.cliArea.clientHeight).gt(cliAreaHeightEnd, 'Saved context for resizable cli is incorrect');
});
test('Verify that user can see saved Key details and Keys tables size on Browser page when he returns back to Browser page', async t => {
    const offsetX = 200;
    const keyListWidth = await browserPage.keyListTable.clientWidth;
    const cliResizeButton = await browserPage.resizeBtnKeyList;

    // move resize 200px right
    await t.drag(cliResizeButton, offsetX, 0, { speed });
    await t.click(myRedisDatabasePage.myRedisDBButton);
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.expect(await browserPage.keyListTable.clientWidth).gt(keyListWidth, 'Saved browser resizable context is proper');
});
test('Verify that user can see saved filter per key type applied when he returns back to Browser page', async t => {
    keyName = common.generateWord(10);
    // Filter per key type String and open Settings
    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    await t.click(myRedisDatabasePage.settingsButton);
    // Return back to Browser and check filter applied
    await t.click(myRedisDatabasePage.browserButton);
    await t.expect(browserPage.selectedFilterTypeString.exists).ok('Filter per key type is still applied');
    // Clear filter
    await t.click(browserPage.clearFilterButton);
    // Filter per key name and open Settings
    await browserPage.searchByKeyName(keyName);
    await t.click(myRedisDatabasePage.settingsButton);
    // Return back to Browser and check filter applied
    await t.click(myRedisDatabasePage.browserButton);
    // Verify that user can see saved input entered into the filter per Key name when he returns back to Browser page
    await verifySearchFilterValue(keyName);
});
test('Verify that user can see saved executed commands in CLI on Browser page when he returns back to Browser page', async t => {
    const commands = [
        'SET key',
        'client getname'
    ];

    // Execute command in CLI and open Settings page
    await t.click(cliPage.cliExpandButton);
    for(const command of commands) {
        await t.typeText(cliPage.cliCommandInput, command, { replace: true, paste: true });
        await t.pressKey('enter');
    }
    await t.click(myRedisDatabasePage.settingsButton);
    // Return back to Browser and check executed command in CLI
    await t.click(myRedisDatabasePage.browserButton);
    for(const command of commands) {
        await t.expect(cliPage.cliCommandExecuted.withExactText(command).exists).ok(`Executed command '${command}' in CLI is saved`);
    }
});
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Verify that user can see key details selected when he returns back to Browser page', async t => {
        // Scroll keys elements
        const scrollY = 1000;
        await t.scroll(browserPage.cssSelectorGrid, 0, scrollY);

        const keysCount = await browserPage.virtualTableContainer.find(browserPage.cssVirtualTableRow).count;
        const targetKey = browserPage.virtualTableContainer.find(browserPage.cssVirtualTableRow).nth(Math.floor(keysCount / 2));
        const targetKeyName = await targetKey.find(browserPage.cssSelectorKey).innerText;
        // Open key details
        await t.click(targetKey);
        await t.expect(await targetKey.getAttribute('class')).contains('table-row-selected', 'Not correct key selected in key list');

        await t.click(myRedisDatabasePage.settingsButton);
        // Return back to Browser and check key details selected
        await t.click(myRedisDatabasePage.browserButton);
        // Check Keys details saved
        await t.expect(browserPage.keyNameFormDetails.innerText).eql(targetKeyName, 'Key details is not saved as context');
        // Check Key selected in Key List
        await t.expect(await targetKey.getAttribute('class')).contains('table-row-selected', 'Not correct key selected in key list');
    });
test
    .after(async() => {
        // Clear and delete database
        await cliPage.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can see list of keys viewed on Browser page when he returns back to Browser page', async t => {
        const numberOfItems = 5000;
        const scrollY = 3200;
        // Open CLI
        await t.click(cliPage.cliExpandButton);
        // Create new keys
        keys = await common.createArrayWithKeyValue(numberOfItems);
        await t.typeText(cliPage.cliCommandInput, `MSET ${keys.join(' ')}`, { replace: true, paste: true });
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
        await t.click(browserPage.refreshKeysButton);

        const keyList = await browserPage.keyListTable;
        const keyListSGrid = await keyList.find(browserPage.cssSelectorGrid);

        // Scroll key list
        await t.scroll(keyListSGrid, 0, scrollY);
        // Find any key from list that is visible
        const renderedRows = await keyList.find(browserPage.cssSelectorRows);
        const renderedRowsCount = await renderedRows.count;
        const randomKey = renderedRows.nth(Math.floor((Math.random() * renderedRowsCount)));
        const randomKeyName = await randomKey.find(browserPage.cssSelectorKey).textContent;

        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        // Check that previous found key is still visible
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(randomKeyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('Scrolled position and saved key list is proper');
    });
