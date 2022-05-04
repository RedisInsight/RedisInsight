import { Chance } from 'chance';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import {commonUrl, ossStandaloneConfig} from '../../../helpers/conf';

const browserPage = new BrowserPage();
const chance = new Chance();

const keyName = chance.word({ length: 20 });
const keyValue = chance.word({ length: 20 });

fixture `Full Screen`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        //Clear and delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await browserPage.addStringKey(keyName, keyValue);
        await browserPage.openKeyDetails(keyName);
    })
    .after(async() => {
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    .meta({ rte: rte.standalone })('Verify that user can switch to full screen from key details in Browser', async t => {
        // Save tables size before switching to full screen mode
        const widthBeforeFullScreen = await browserPage.keyDetailsTable.clientWidth;
        // Switch to full screen mode
        await t.click(browserPage.fullScreenModeButton);
        // Compare size of details table after switching
        const widthAfterFullScreen = await browserPage.keyDetailsTable.clientWidth;
        await t.expect(widthAfterFullScreen).gt(widthBeforeFullScreen, 'Width after switching to full screen');
        await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).ok('Key Details Table');
        await t.expect(browserPage.stringKeyValueInput.withExactText(keyValue).exists).ok('Key Value in Details');
        // Verify that user can exit full screen in key details and two tables with keys and key details are displayed
        await t.click(browserPage.fullScreenModeButton.nth(1));
        const widthAfterExitFullScreen = await browserPage.keyDetailsTable.clientWidth;
        await t.expect(widthAfterExitFullScreen).lt(widthAfterFullScreen, 'Width after switching from full screen');
    });
test
    .meta({ rte: rte.standalone })('Verify that when no keys are selected user can click on "Close" control for right table and see key list in full screen', async t => {
        // Save key table size before switching to full screen
        const widthKeysBeforeFullScreen = await browserPage.keyListTable.clientWidth;
        // Close right panel with key details
        await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).notOk('Key Details Table');
        await t.click(browserPage.closeRightPanel);
        // Check that table is in full screen
        const widthTableAfterFullScreen = await browserPage.keyListTable.clientWidth;
        await t.expect(widthTableAfterFullScreen).gt(widthKeysBeforeFullScreen, 'Width after switching to full screen');
    });
test
    .before(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await browserPage.addSetKey(keyName, keyValue);
        await browserPage.openKeyDetails(keyName);
    })
    .after(async() => {
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    .meta({ rte: rte.standalone })('Verify that when user closes key details in full screen mode the list of keys displayed in full screen', async t => {
        // Save key table size before switching to full screen
        const widthKeysBeforeFullScreen = await browserPage.keyListTable.clientWidth;
        // Open full mode for key details
        await t.click(browserPage.fullScreenModeButton);
        // Close key details
        await t.click(browserPage.closeKeyButton);
        // Check that key list is opened in full screen
        const widthTableAfterFullScreen = await browserPage.keyListTable.clientWidth;
        await t.expect(widthTableAfterFullScreen).gt(widthKeysBeforeFullScreen, 'Width after switching to full screen');
        // Verify that user can exit full screen in key list and two tables with keys and key details are displayed
        await t.click(browserPage.disableFullScreenModeButton);
        // Check that key list table and key details table are displayed
        const widthKeysAfterExitFullScreen = await browserPage.keyListTable.clientWidth;
        await t.expect(widthKeysAfterExitFullScreen).lt(widthTableAfterFullScreen, 'Width after switching from full screen');
        await t.expect(browserPage.noKeysToDisplayText.withExactText('Select the key from the list on the left to see the details of the key.').visible).ok('No key selected');
    });
