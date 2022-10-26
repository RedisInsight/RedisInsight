import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    WorkbenchPage,
    BrowserPage
} from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();

fixture `Database info tooltips`
    .meta({type: 'regression', rte: rte.standalone})
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see DB name, endpoint, connection type, Redis version, user name in tooltip when hover over the (i) icon', async t => {
    const version = /[0-9].[0-9].[0-9]/;

    await t.hover(browserPage.databaseInfoIcon);
    await t.expect(browserPage.databaseInfoToolTip.textContent).contains(ossStandaloneConfig.databaseName, 'User can see database name in tooltip');
    await t.expect(browserPage.databaseInfoToolTip.textContent).contains(`${ossStandaloneConfig.host}:${ossStandaloneConfig.port}`, 'User can see endpoint in tooltip');
    await t.expect(browserPage.databaseInfoToolTip.textContent).contains('Standalone', 'User can not see connection type in tooltip');
    await t.expect(browserPage.databaseInfoToolTip.textContent).match(version, 'User can not see Redis version in tooltip');
    await t.expect(browserPage.databaseInfoToolTip.textContent).contains('Default', 'User can not see user name in tooltip');

    // Verify that user can see an (i) icon next to the database name on Browser and Workbench pages
    await t.expect(browserPage.databaseInfoIcon.visible).ok('User can not see (i) icon on Browser page', { timeout: 10000 });
    // Move to the Workbench page and check icon
    await t.click(myRedisDatabasePage.workbenchButton);
    await t.expect(workbenchPage.overviewTotalMemory.visible).ok('User can not see (i) icon on Workbench page', { timeout: 10000 });
});
