import { addNewStandaloneDatabase } from '../../../helpers/database';
import { Chance } from 'chance';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import {
  MyRedisDatabasePage,
  BrowserPage,
  CliPage,
  DatabaseOverviewPage,
  WorkbenchPage
} from '../../../pageObjects';
import {
  commonUrl,
  ossStandaloneConfig,
  ossStandaloneRedisearch,
  ossStandaloneBigConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const cliPage = new CliPage();
const databaseOverviewPage = new DatabaseOverviewPage();
const chance = new Chance();
const common = new Common();
const workbenchPage = new WorkbenchPage();

const fiveSecondsTimeout = 5000;
let keyName = chance.string({ length: 10 });
let keys: string[];
let keys1: string[];
let keys2: string[];
let keysForDelete = [];

fixture `Database overview`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .after(async () => {
        //Delete databases
        await deleteDatabase(ossStandaloneConfig.databaseName);
        await deleteDatabase(ossStandaloneRedisearch.databaseName);
    })
    ('Verify that user can see the list of Modules updated each time when he connects to the database', async t => {
        let firstDatabaseModules = [];
        let secondDatabaseModules = [];
        //Remember modules
        let countOfModules = await browserPage.modulesButton.count;
        for(let i = 0; i < countOfModules; i++) {
            firstDatabaseModules.push(await browserPage.modulesButton.nth(i).getAttribute('data-testid'));
        }
        //Verify the list of modules in Browser page
        for (let module of firstDatabaseModules) {
            await t.expect(databaseOverviewPage.databaseModules.withAttribute('aria-labelledby', module).exists).ok(`${module} is displayed in the list`);
        }
        //Open the Workbench page and verify modules
        await t.click(myRedisDatabasePage.workbenchButton);
        for (let module of firstDatabaseModules) {
            await t.expect(databaseOverviewPage.databaseModules.withAttribute('aria-labelledby', module).exists).ok(`${module} is displayed in the list`);
        }
        //Add database with different modules
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await addNewStandaloneDatabase(ossStandaloneRedisearch);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneRedisearch.databaseName);
        countOfModules = await browserPage.modulesButton.count;
        for(let i = 0; i < countOfModules; i++) {
            secondDatabaseModules.push(await browserPage.modulesButton.nth(i).getAttribute('data-testid'));
        }
        //Verify the list of modules
        for (let module of secondDatabaseModules) {
            await t.expect(databaseOverviewPage.databaseModules.withAttribute('aria-labelledby', module).exists).ok(`${module} is displayed in the list`);
        }
        await t.expect(firstDatabaseModules).notEql(secondDatabaseModules, 'The list of Modules updated');
    });
test('Verify that when user adds or deletes a new key, info in DB header is updated in 5 seconds', async t => {
    keyName = chance.string({ length: 10 });
    //Remember the total keys number
    const totalKeysBeforeAdd = await browserPage.overviewTotalKeys.innerText;
    //Add new key
    await browserPage.addHashKey(keyName);
    //Wait 5 seconds
    await t.wait(fiveSecondsTimeout);
    //Verify that the info on DB header is updated after adds
    const totalKeysAftreAdd = await browserPage.overviewTotalKeys.innerText;
    await t.expect(totalKeysAftreAdd).eql((Number(totalKeysBeforeAdd) + 1).toString(), 'Info in DB header after ADD');
    //Delete key
    await browserPage.deleteKeyByName(keyName);
    //Wait 5 seconds
    await t.wait(fiveSecondsTimeout);
    //Verify that the info on DB header is updated after deletion
    const totalKeysAftreDelete = await browserPage.overviewTotalKeys.innerText;
    await t.expect(totalKeysAftreDelete).eql((Number(totalKeysAftreAdd) - 1).toString(), 'Info in DB header after DELETE');
});
test
    .after(async t => {
        //Clear and delete database
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await cliPage.sendCommandInCli(`DEL ${keys1.join(' ')}`);
        await cliPage.sendCommandInCli(`DEL ${keys2.join(' ')}`);
        await deleteDatabase(ossStandaloneConfig.databaseName);
        await deleteDatabase(ossStandaloneBigConfig.databaseName);
    })
    ('Verify that user can see total number of keys rounded in format 100, 1K, 1M, 1B in DB header in Browser page', async t => {
        //Add 100 keys
        keys1 = await common.createArrayWithKeyValue(100);
        await cliPage.sendCommandInCli(`MSET ${keys1.join(' ')}`);
        //Wait 5 seconds
        await t.wait(fiveSecondsTimeout);
        //Verify that the info on DB header is updated after adds
        let totalKeys = await browserPage.overviewTotalKeys.innerText;
        await t.expect(totalKeys).eql('100', 'Info in DB header after ADD 100 keys');
        //Add 1000 keys
        keys2 = await common.createArrayWithKeyValue(1000);
        await cliPage.sendCommandInCli(`MSET ${keys2.join(' ')}`);
        //Wait 5 seconds
        await t.wait(fiveSecondsTimeout);
        //Verify that the info on DB header is updated after adds
        totalKeys = await browserPage.overviewTotalKeys.innerText;
        await t.expect(totalKeys).eql('1 K', 'Info in DB header after ADD 1000 keys');
        //Add database with more than 1M keys
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await addNewStandaloneDatabase(ossStandaloneBigConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneBigConfig.databaseName);
        //Wait 5 seconds
        await t.wait(fiveSecondsTimeout);
        //Verify that the info on DB header is rounded
        totalKeys = await browserPage.overviewTotalKeys.innerText;
        await t.expect(totalKeys).eql('18 M', 'Info in DB header is 18 M keys');
    });
test
    .after(async () => {
        //Clear and delete database
        await cliPage.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can see total memory rounded in format B, KB, MB, GB, TB in DB header in Browser page', async t => {
        //Add new keys
        keys = await common.createArrayWithKeyValue(100);
        await cliPage.sendCommandInCli(`MSET ${keys.join(' ')}`);
        //Verify total memory
        await t.wait(fiveSecondsTimeout);
        await t.expect(browserPage.overviewTotalMemory.textContent).contains('MB', 'Total memory value is MB');
    });
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .after(async () => {
        //Delete database and index
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX permits DD`);
        await deleteDatabase(ossStandaloneBigConfig.databaseName);
    })
    ('Verify that user can see additional information in Overview: Connected Clients, Commands/Sec, CPU (%) using Standalone DB connection type', async t => {
        const commandsSecBeforeEdit = await browserPage.overviewCommandsSec.textContent;
        //Wait 5 second
        await t.wait(fiveSecondsTimeout);
        const cpuBeforeEdit = (await browserPage.overviewCpu.textContent).split(' ')[0];
        //Verify that additional information in Overview: Connected Clients, Commands/Sec, CPU (%) is displayed
        await t.expect(browserPage.overviewConnectedClients.visible).ok('Connected Clients is dispalyed in the Overview');
        await t.expect(browserPage.overviewCommandsSec.visible).ok('Commands/Sec is dispalyed in the Overview');
        await t.expect(browserPage.overviewCpu.visible).ok('CPU (%) is dispalyed in the Overview');
        //Run Create hash index command
        await t.click(workbenchPage.internalLinkWorkingWithHashes);
        await t.click(workbenchPage.preselectCreateHashIndex);
        await t.click(workbenchPage.submitCommandButton);
        //Verify that CPU and commands per second parameters are changed
        const commandsSecAfterEdit = await browserPage.overviewCommandsSec.textContent;
        //Wait 5 seconds
        await t.wait(fiveSecondsTimeout);
        const cpuAfterEdit = (await browserPage.overviewCpu.textContent).split(' ')[0];
        await t.expect(Number(cpuAfterEdit)).gt(Number(cpuBeforeEdit), 'CPU parameter is changed');
        await t.expect(commandsSecAfterEdit).notEql(commandsSecBeforeEdit, 'Commands per second parameter is changed');
    });
