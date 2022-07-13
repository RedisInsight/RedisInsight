import { Chance } from 'chance';
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

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();
const common = new Common();
const browserPage = new BrowserPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const chance = new Chance();

let keys: string[];
const keyName = chance.word({ length: 10 });
const keysAmount = 5;
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
        await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneConfig.databaseName  } [${index}]`);
        keys = await common.createArrayWithKeyValue(keysAmount);
        await cliPage.sendCommandInCli(`MSET ${keys.join(' ')}`);
    })
    .afterEach(async t => {
        //Clear and delete databases
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneConfig.databaseName  } [${index}]`);
        await cliPage.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await deleteDatabase(`${ossStandaloneConfig.databaseName  } [${index}]`);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that user can hover over keys icon in Overview and sees total number of keys and number of keys in current logical database (if there are any keys in other logical DBs)', async t => {
    //Wait for Total Keys number refreshed
    await t.expect(browserPage.overviewTotalKeys.withText(`${keysAmount + 1}`).exists).ok('Total keys are not changed', { timeout: 10000 });
    await t.hover(workbenchPage.overviewTotalKeys);
    //Verify that user can see total number of keys and number of keys in current logical database
    await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
    await t.expect(browserPage.tooltip.textContent).contains(`${keysAmount + 1}Total Keys`, 'Total keys text is incorrect');
    await t.expect(browserPage.tooltip.textContent).contains(`db1:${keysAmount}Keys`, 'Local DB keys text is incorrect');
});
test('Verify that user can hover over keys icon in Overview and sees total number of keys and do not see number of keys in current logical database (if there are no any keys in other logical DBs)', async t => {
    //Open Database
    await t.click(myRedisDatabasePage.myRedisDBButton);
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.hover(workbenchPage.overviewTotalKeys);
    //Verify that user can see only total number of keys
    await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
    await t.expect(browserPage.tooltip.textContent).contains(`${keysAmount + 1}Total Keys`, 'Total keys text is incorrect');
    await t.expect(browserPage.tooltip.textContent).notContains('db1', 'Local DB keys text is displayed');
});
test
    .before(async t => {
        await acceptLicenseTerms();
        await addRedisDatabasePage.addRedisDataBase(cloudDatabaseConfig);
        //Click for saving
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(cloudDatabaseConfig.databaseName).exists).ok('The existence of the database', { timeout: 5000 });
        await myRedisDatabasePage.clickOnDBByName(cloudDatabaseConfig.databaseName);
    })
    .after(async() => {
        //Delete database
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that when users hover over keys icon in Overview for Cloud DB, they see only total number of keys in tooltip', async t => {
        await t.hover(workbenchPage.overviewTotalKeys);
        //Verify that user can see only total number of keys
        await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
        await t.expect(browserPage.tooltip.textContent).contains('Total Keys', 'Total keys text is incorrect');
        await t.expect(browserPage.tooltip.textContent).notContains('db1', 'Local DB keys text is displayed');
    });
