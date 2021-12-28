import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
  MyRedisDatabasePage,
  BrowserPage,
  UserAgreementPage,
  CliPage,
  AddRedisDatabasePage,
  DatabaseOverviewPage
} from '../../../pageObjects';
import {
  commonUrl,
  ossStandaloneConfig,
  ossStandaloneRedisearch
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const cliPage = new CliPage();
const databaseOverviewPage = new DatabaseOverviewPage();

const fiveSecondsTimeout = 5000;

fixture `Database overview`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async(t) => {
        //Clear database
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
        //Delete all databases
        await myRedisDatabasePage.deleteAllDatabases();
    })
test('Verify that user can see the list of Modules updated each time when he connects to the database', async t => {
    let firstDatabaseModules = [];
    let secondDatabaseModules = [];
    //Connect to DB and remember modules
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
    const keyName = 'keyName123';
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
test('Verify that user can see total number of keys rounded in format 100, 1K, 1M, 1B in DB header in Browser page', async t => {
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Add 100 keys
    await cliPage.addKeysFromCli('MSET', 100);
    //Wait 5 seconds
    await t.wait(fiveSecondsTimeout);
    //Verify that the info on DB header is updated after adds
    let totalKeys = await browserPage.overviewTotalKeys.innerText;
    await t.expect(totalKeys).eql('100', 'Info in DB header after ADD 100 keys');
    //Add 1000 keys
    await cliPage.addKeysFromCli('MSET', 1000);
    //Wait 5 seconds
    await t.wait(fiveSecondsTimeout);
    //Verify that the info on DB header is updated after adds
    totalKeys = await browserPage.overviewTotalKeys.innerText;
    await t.expect(totalKeys).eql('1 K', 'Info in DB header after ADD 1000 keys');
    //Add 1M keys
    for(let i = 0; i < 10; i++) {
        await cliPage.addKeysFromCli('MSET', 100000, `keyName${i}`);
    }
    //Wait 5 seconds
    await t.wait(fiveSecondsTimeout);
    //Verify that the info on DB header is updated after adds
    totalKeys = await browserPage.overviewTotalKeys.innerText;
    await t.expect(totalKeys).eql('1 M', 'Info in DB header after ADD 1M keys');
});
test('Verify that user can see total memory rounded in format B, KB, MB, GB, TB in DB header in Browser page', async t => {
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Add new keys
    await cliPage.addKeysFromCli('MSET', 100);
    //Verify total memory
    await t.wait(fiveSecondsTimeout);
    await t.expect(browserPage.overviewTotalMemory.textContent).contains('MB', 'Total memory value is MB');
});
test('Verify that user can see additional information in Overview: Connected Clients, Commands/Sec, CPU (%) using Standalone DB connection type', async t => {
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    const cpuBeforeEdit = await browserPage.overviewCpu.textContent;
    const commandsSecBeforeEdit = await browserPage.overviewCommandsSec.textContent;
    //Verify that additional information in Overview: Connected Clients, Commands/Sec, CPU (%) is displayed
    await t.expect(browserPage.overviewConnectedClients.visible).ok('Connected Clients is dispalyed in the Overview');
    await t.expect(browserPage.overviewCommandsSec.visible).ok('Commands/Sec is dispalyed in the Overview');
    await t.expect(browserPage.overviewCpu.visible).ok('CPU (%) is dispalyed in the Overview');
    //Add 1M keys
    for(let i = 0; i < 10; i++) {
        await cliPage.addKeysFromCli('MSET', 100000, `keyName${i}`);
    }
    //Verify that CPU and commands per second parameters are changed
    const cpuAfterEdit = await browserPage.overviewCpu.textContent;
    const commandsSecAfterEdit = await browserPage.overviewCommandsSec.textContent;

    await t.expect(cpuAfterEdit).notEql(cpuBeforeEdit, 'CPU parameter is changed');
    await t.expect(commandsSecAfterEdit).notEql(commandsSecBeforeEdit, 'Commands per second parameter is changed');
});
