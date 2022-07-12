import { acceptLicenseTerms, acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    CliPage,
    WorkbenchPage,
    BrowserPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { cloudDatabaseConfig, commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { Chance } from 'chance';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();
const common = new Common();
const browserPage = new BrowserPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const chance = new Chance();

let keys: string[];
let keyName = chance.word({ length: 10 });
const index = '1';

fixture `Database overview`
    .meta({ rte: rte.standalone, type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        //Create databases and keys
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await browserPage.addStringKey(keyName);
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await addRedisDatabasePage.addLogicalRedisDatabase(ossStandaloneConfig, index);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName + ` [${index}]`);
        keys = await common.createArrayWithKeyValue(5);
        await cliPage.sendCommandInCli(`MSET ${keys.join(' ')}`);
    })
    .afterEach(async t => {
        //Clear and delete databases
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName + ` [${index}]`);
        await cliPage.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await deleteDatabase(ossStandaloneConfig.databaseName + ` [${index}]`);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that user can hover over keys icon in Overview and sees total number of keys and number of keys in current logical database (if there are any keys in other logical DBs)', async t => {
    //Wait for Total Keys number refreshed
    await t.expect(browserPage.overviewTotalKeys.withText('6').exists).ok('Total keys are not changed', { timeout: 10000 });
    await t.hover(workbenchPage.overviewTotalKeys);
    //Verify that user can see total number of keys and number of keys in current logical database
    await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
    await t.expect(browserPage.tooltip.textContent).contains('6Total Keys', 'Total keys text is incorrect');
    await t.expect(browserPage.tooltip.textContent).contains('db1:5Keys', 'Local DB keys text is incorrect');
});
test('Verify that user can hover over keys icon in Overview and sees total number of keys and do not see number of keys in current logical database (if there are no any keys in other logical DBs)', async t => {
    //Open Database
    await t.click(myRedisDatabasePage.myRedisDBButton);
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.hover(workbenchPage.overviewTotalKeys);
    //Verify that user can see only total number of keys
    await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
    await t.expect(browserPage.tooltip.textContent).contains('6Total Keys', 'Total keys text is incorrect');
    await t.expect(browserPage.tooltip.textContent).notContains('db1', 'Local DB keys text is displayed');
});
// Skip due to prod cloud DBs issue https://redislabs.atlassian.net/browse/RI-2793
test.skip
    .before(async t => {
        await acceptLicenseTerms();
        await addRedisDatabasePage.addRedisDataBase(cloudDatabaseConfig);
        //Click for saving
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        //Increase timeout to add Cloud DB (due to RI-1993 issue)
        await t.wait(5000);
        //Refresh the page
        await t.eval(() => location.reload());
        //Wait for database to be exist
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(cloudDatabaseConfig.databaseName).exists).ok('The existence of the database', { timeout: 5000 });
        await myRedisDatabasePage.clickOnDBByName(cloudDatabaseConfig.databaseName);
    })
    .after(async () => {
        //Delete database
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that when users hover over keys icon in Overview for Cloud DB, they see only total number of keys in tooltip', async t => {
        //Create new keys
        keys = await common.createArrayWithKeyValue(5);
        await cliPage.sendCommandInCli(`MSET ${keys.join(' ')}`);
        //Wait for Total Keys number refreshed
        await t.expect(browserPage.overviewTotalKeys.withText('6').exists).ok('Total keys are not changed', { timeout: 10000 });
        await t.hover(workbenchPage.overviewTotalKeys);
        //Verify that user can see only total number of keys
        await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
        await t.expect(browserPage.tooltip.textContent).contains('6Total Keys', 'Total keys text is incorrect');
        await t.expect(browserPage.tooltip.textContent).notContains('db1', 'Local DB keys text is displayed');
    });