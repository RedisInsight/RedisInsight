import { acceptLicenseTermsAndAddDatabase, acceptLicenseTermsAndAddRECloudDatabase, deleteCustomDatabase, deleteDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    CliPage,
    WorkbenchPage,
    BrowserPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { cloudDatabaseConfig, commonUrl, ossStandaloneRedisearch } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { BrowserActions } from '../../../common-actions/browser-actions';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();
const common = new Common();
const browserPage = new BrowserPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const browserActions = new BrowserActions();

let keys: string[];
const keyName = common.generateWord(10);
const keysAmount = 5;
const index = '1';

fixture `Database overview`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        // Create databases and keys
        await acceptLicenseTermsAndAddDatabase(ossStandaloneRedisearch, ossStandaloneRedisearch.databaseName);
        await browserPage.addStringKey(keyName);
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await addRedisDatabasePage.addLogicalRedisDatabase(ossStandaloneRedisearch, index);
        await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneRedisearch.databaseName} [db${index}]`);
        keys = await common.createArrayWithKeyValue(keysAmount);
        await cliPage.sendCommandInCli(`MSET ${keys.join(' ')}`);
    })
    .afterEach(async t => {
        // Clear and delete databases
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneRedisearch.databaseName} [db${index}]`);
        await cliPage.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await deleteCustomDatabase(`${ossStandaloneRedisearch.databaseName} [db${index}]`);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneRedisearch.databaseName);
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneRedisearch);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can see total and current logical database number of keys (if there are any keys in other logical DBs)', async t => {
        // Wait for Total Keys number refreshed
        await t.expect(browserPage.overviewTotalKeys.withText(`${keysAmount + 1}`).exists).ok('Total keys are not changed', { timeout: 10000 });
        await t.hover(workbenchPage.overviewTotalKeys);
        // Verify that user can see total number of keys and number of keys in current logical database
        await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
        await browserActions.verifyTooltipContainsText(`${keysAmount + 1}Total Keys`, true);
        await browserActions.verifyTooltipContainsText(`db1:${keysAmount}Keys`, true);

        // Open Database
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneRedisearch.databaseName);
        await t.hover(workbenchPage.overviewTotalKeys);
        // Verify that user can see total number of keys and not it current logical database (if there are no any keys in other logical DBs)
        await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
        await browserActions.verifyTooltipContainsText(`${keysAmount + 1}Total Keys`, true);
        await browserActions.verifyTooltipContainsText('db1', false);
    });
test
    .meta({ rte: rte.reCloud })
    .before(async() => {
        await acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig);
    })
    .after(async() => {
        // Delete database
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that when users hover over keys icon in Overview for Cloud DB, they see only total number of keys in tooltip', async t => {
        await t.hover(workbenchPage.overviewTotalKeys);
        // Verify that user can see only total number of keys
        await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
        await browserActions.verifyTooltipContainsText('Total Keys', true);
        await browserActions.verifyTooltipContainsText('db1', false);
    });
