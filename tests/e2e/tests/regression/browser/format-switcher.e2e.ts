import { keyLength, rte } from '../../../helpers/constants';
import { addKeysViaCli, deleteKeysViaCli, keyTypes } from '../../../helpers/keys';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();
const common = new Common();

const keysData = keyTypes.map(object => ({ ...object }));
keysData.forEach(key => key.keyName = `${key.keyName}` + '-' + `${common.generateWord(keyLength)}`);
const defaultValue = 'Unicode';

fixture `Format switcher functionality`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Create new keys
        await addKeysViaCli(keysData);
    })
    .afterEach(async() => {
        // Clear keys and database
        await deleteKeysViaCli(keysData);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see switcher changed to default for key when reopening key details', async t => {
    // Open key details and select JSON formatter
    await browserPage.openKeyDetails(keysData[0].keyName);
    await browserPage.selectFormatter('JSON');
    // Reopen key details
    await t.click(browserPage.closeKeyButton);
    await browserPage.openKeyDetailsByKeyName(keysData[0].keyName);
    // Verify that formatter changed to default 'Unicode'
    await t.expect(browserPage.formatSwitcher.withExactText(defaultValue).visible).ok('Formatter value is not default');
});
test('Verify that user can see switcher changed to default for key when switching between keys when details tab opened', async t => {
    // Open key details and select HEX formatter
    await t.click(browserPage.searchButton);
    await browserPage.openKeyDetailsByKeyName(keysData[1].keyName);
    await browserPage.selectFormatter('HEX');
    // Open another key details
    await browserPage.openKeyDetailsByKeyName(keysData[3].keyName);
    // Verify that formatter changed to default 'Unicode'
    await t.expect(browserPage.formatSwitcher.withExactText(defaultValue).visible).ok('Formatter value is not default');
});
test('Verify that user don`t see format switcher for JSON, GRAPH, TS keys', async t => {
    // Create array with JSON, GRAPH, TS keys
    const keysWithoutSwitcher = [keysData[5], keysData[7], keysData[8]];
    for (let i = 0; i < keysWithoutSwitcher.length; i++) {
        await browserPage.openKeyDetailsByKeyName(keysWithoutSwitcher[i].keyName);
        // Verify that format switcher is not displayed
        await t.expect(browserPage.formatSwitcher.visible).notOk(`Formatter is displayed for ${keysWithoutSwitcher[i].textType} type`, { timeout: 1000 });
    }
});
test('Verify that user can see switcher icon for narrow screen and tooltip by hovering', async t => {
    await browserPage.openKeyDetails(keysData[0].keyName);
    await browserPage.selectFormatter('JSON');
    // Verify icon is not displayed with high screen resolution
    await t.expect(browserPage.formatSwitcherIcon.visible).notOk('Format switcher Icon is displayed with high screen resolution');
    // Minimize the window to check icon
    await t.resizeWindow(1500, 900);
    // Verify icon is displayed with low screen resolution
    await t.expect(browserPage.formatSwitcherIcon.visible).ok('Format switcher Icon is not displayed with low screen resolution');
    await t.hover(browserPage.formatSwitcher);
    // Verify tooltip is displayed on hover with low screen resolution
    await t.expect(browserPage.tooltip.textContent).contains('JSON', 'Selected formatter is not displayed in tooltip');
});
