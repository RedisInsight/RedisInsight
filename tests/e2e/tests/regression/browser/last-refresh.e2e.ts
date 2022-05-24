import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });

fixture `Last refresh`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can see the date and time of the last update of my Keys in the tooltip', async t => {
        //Hover on the refresh icon
        await t.hover(browserPage.refreshKeysButton);
        //Verify the last update info
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nnow', 'tooltip text');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see my timer updated when I refresh the list of Keys of the list of values', async t => {
        keyName = chance.word({ length: 10 });
        //Add key
        await browserPage.addStringKey(keyName);
        await browserPage.openKeyDetails(keyName);
        //Wait for 2 min
        await t.wait(120000);
        //Hover on the refresh icon
        await t.hover(browserPage.refreshKeyButton);
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\n2 min', 'tooltip text');
        //Click on Refresh and check last refresh
        await t.click(browserPage.refreshKeyButton);
        await t.hover(browserPage.refreshKeyButton);
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nnow', 'tooltip text');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see the date and time of the last update of my Key values in the tooltip', async t => {
        keyName = chance.word({ length: 10 });
        //Add key
        await browserPage.addStringKey(keyName);
        await browserPage.openKeyDetails(keyName);
        //Hover on the refresh icon
        await t.hover(browserPage.refreshKeyButton);
        //Verify the last update info
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nnow', 'tooltip text');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see my last refresh updated each time I hover over the Refresh icon', async t => {
        keyName = chance.word({ length: 10 });
        //Add key
        await browserPage.addStringKey(keyName);
        await browserPage.openKeyDetails(keyName);
        //Hover on the keys refresh icon
        await t.hover(browserPage.refreshKeysButton);
        //Verify the last update info
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nnow', 'tooltip text');
        //Hover on the key in details refresh icon
        await t.hover(browserPage.refreshKeyButton);
        //Verify the last update info
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nnow', 'tooltip text');
    });
