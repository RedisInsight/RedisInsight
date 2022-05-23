import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    WorkbenchPage,
    BrowserPage
} from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();

fixture `Database info tooltips`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can see an (i) icon next to the database name on Browser and Workbench pages', async t => {
        await t.expect(browserPage.databaseInfoIcon.visible).ok('User can see (i) icon on Browser page', { timeout: 10000 });
        //Move to the Workbench page and check icon
        await t.click(myRedisDatabasePage.workbenchButton);
        await t.expect(workbenchPage.overviewTotalMemory.visible).ok('User can see (i) icon on Workbench page', { timeout: 10000 });
    });
test
    .meta({ rte: rte.standalone })('Verify that user can see DB name, endpoint, connection type, Redis version, user name in tooltip when hover over the (i) icon', async t => {
        const version = /[0-9].[0-9].[0-9]/;
        await t.hover(browserPage.databaseInfoIcon);
        await t.expect(browserPage.databaseInfoToolTip.textContent).contains(ossStandaloneConfig.databaseName, 'User can see database name in tooltip');
        await t.expect(browserPage.databaseInfoToolTip.textContent).contains(`${ossStandaloneConfig.host}:${ossStandaloneConfig.port}`, 'User can see endpoint in tooltip');
        await t.expect(browserPage.databaseInfoToolTip.textContent).contains('Standalone', 'User can see connection type in tooltip');
        await t.expect(browserPage.databaseInfoToolTip.textContent).match(version, 'User can see Redis version in tooltip');
        await t.expect(browserPage.databaseInfoToolTip.textContent).contains('Default', 'User can see user name in tooltip');
    });
