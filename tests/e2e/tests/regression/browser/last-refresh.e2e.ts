import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();

let keyName = Common.generateWord(10);

fixture `Last refresh`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see my timer updated when I refresh the list of Keys of the list of values', async t => {
    keyName = Common.generateWord(10);
    // Hover on the refresh icon
    await t.hover(browserPage.refreshKeysButton);
    // Verify that user can see the date and time of the last update of my Keys in the tooltip
    await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nnow', 'tooltip text not correct');

    // Add key
    await browserPage.addStringKey(keyName);
    await browserPage.openKeyDetails(keyName);
    // Wait for 1 min
    await t.wait(60000);
    // Hover on the refresh icon
    await t.hover(browserPage.refreshKeyButton);
    await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\n1 min', 'tooltip text not correct');
    // Click on Refresh and check last refresh
    await t.click(browserPage.refreshKeyButton);
    await t.hover(browserPage.refreshKeyButton);
    // Verify that user can see the date and time of the last update of my Key values in the tooltip
    // Verify that user can see my last refresh updated each time I hover over the Refresh icon
    await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nnow', 'tooltip text not correct');
});
