import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    CliPage,
    WorkbenchPage,
    BrowserPage
} from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();
const common = new Common();
const browserPage = new BrowserPage();

let keys: string[];

fixture `Database overview`
    .meta({type: 'regression'})
    .page(commonUrl)
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
    ('Verify that user can see total memory and total number of keys updated in DB header in Workbench page', async t => {
        //Create new keys
        keys = await common.createArrayWithKeyValue(10);
        await cliPage.sendCommandInCli(`MSET ${keys.join(' ')}`);
        //Open Workbench
        await t.click(myRedisDatabasePage.workbenchButton);
        //Verify that user can see total memory and total number of keys
        await t.expect(workbenchPage.overviewTotalKeys.exists).ok('User can see total keys');
        await t.expect(workbenchPage.overviewTotalMemory.exists).ok('User can see total memory');
    });
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can connect to DB and see breadcrumbs at the top of the application', async t => {
        //Verify that user can see breadcrumbs in Browser and Workbench views
        await t.expect(browserPage.breadcrumbsContainer.visible).ok('User can see breadcrumbs in Browser page', { timeout: 20000 });
        await t.click(myRedisDatabasePage.workbenchButton);
        await t.expect(browserPage.breadcrumbsContainer.visible).ok('User can see breadcrumbs in Workbench page', { timeout: 20000 });
    });
