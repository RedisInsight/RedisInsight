import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const cliPage = new CliPage();

const keyName = 'KeyForSearch789';

fixture `Last refresh`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async t => {
        //Remove key
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, `DEL ${keyName}`);
        await t.pressKey('enter');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see the date and time of the last update of my Keys in the tooltip', async t => {
        //Open database
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Hover on the refresh icon
        await t.hover(browserPage.refreshKeysButton);
        //Verify the last update info
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nless than a minute ago', 'tooltip text');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see my timer updated when I refresh the list of Keys of the list of values', async t => {
        //Open database
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Add key
        await browserPage.addStringKey(keyName);
        await browserPage.openKeyDetails(keyName);
        //Wait for 2 min
        await t.wait(120000);
        //Hover on the refresh icon
        await t.hover(browserPage.refreshKeyButton);
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\n2 minutes ago', 'tooltip text');
        //Click on Refresh and check last refresh
        await t.click(browserPage.refreshKeyButton);
        await t.hover(browserPage.refreshKeyButton);
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nless than a minute ago', 'tooltip text');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see the date and time of the last update of my Key values in the tooltip', async t => {
        //Open database
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Add key
        await browserPage.addStringKey(keyName);
        await browserPage.openKeyDetails(keyName);
        //Hover on the refresh icon
        await t.hover(browserPage.refreshKeyButton);
        //Verify the last update info
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nless than a minute ago', 'tooltip text');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see my last refresh updated each time I hover over the Refresh icon', async t => {
        //Open database
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Add key
        await browserPage.addStringKey(keyName);
        await browserPage.openKeyDetails(keyName);
        //Hover on the keys refresh icon
        await t.hover(browserPage.refreshKeysButton);
        //Verify the last update info
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nless than a minute ago', 'tooltip text');
        //Hover on the key in details refresh icon
        await t.hover(browserPage.refreshKeyButton);
        //Verify the last update info
        await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nless than a minute ago', 'tooltip text');
    });
