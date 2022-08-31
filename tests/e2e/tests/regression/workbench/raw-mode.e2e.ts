import { acceptLicenseTerms, acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { WorkbenchPage, MyRedisDatabasePage, BrowserPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { addNewStandaloneDatabasesApi, deleteStandaloneDatabaseApi, deleteStandaloneDatabasesApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const common = new Common();
const browserPage = new BrowserPage();

const keyName = common.generateWord(10);
const keyValue = '\\xe5\\x90\\x8d\\xe5\\xad\\x97';
const unicodeValue = '名字';
const rawModeIcon = '-r';
const commandsForSend = [
    `set ${keyName} "${keyValue}"`,
    `get ${keyName}`
];
const databasesForAdding = [
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: 'testDB1' },
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: 'testDB2' }
];

fixture `Workbench Raw mode`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.browserButton);
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Use raw mode for Workbech result', async t => {
    // Send commands
    await workbenchPage.sendCommandsArrayInWorkbench(commandsForSend);
    // Display result in Ascii when raw mode is off
    await t.expect(workbenchPage.queryTextResult.textContent).contains(`"${keyValue}"`, 'The result is not correct');
    // Verify that user can't see Raw marker in Workbench command history
    await t.expect(workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssCommandExecutionDateTime).textContent)
        .notContains(rawModeIcon, 'Raw mode icon is displayed in command history');
    //Send command in raw mode
    await t.click(workbenchPage.rawModeBtn);
    await workbenchPage.sendCommandInWorkbench(commandsForSend[1]);
    // Verify that user can see command result execution in raw mode
    await workbenchPage.checkWorkbenchCommandResult(commandsForSend[1], `"${unicodeValue}"`);
    // Verify that user can see R marker in command history
    await t.expect(workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssCommandExecutionDateTime).textContent)
        .contains(rawModeIcon, 'No raw mode icon in command history');
});
test
    .before(async t => {
        // Add new databases using API
        await acceptLicenseTerms();
        await addNewStandaloneDatabasesApi(databasesForAdding);
        // Reload Page
        await common.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[0].databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .after(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.browserButton);
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabasesApi(databasesForAdding);
    })('Save Raw mode state', async t => {
        //Send command in raw mode
        await t.click(workbenchPage.rawModeBtn);
        await workbenchPage.sendCommandsArrayInWorkbench(commandsForSend);
        // Verify that user can see saved Raw mode state after page refresh
        await common.reloadPage();
        await workbenchPage.sendCommandInWorkbench(commandsForSend[1]);
        await workbenchPage.checkWorkbenchCommandResult(commandsForSend[1], `"${unicodeValue}"`);
        // Go to another database
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[1].databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
        // Verify that user can see saved Raw mode state after re-connection to another DB
        await workbenchPage.sendCommandInWorkbench(commandsForSend[1]);
        await workbenchPage.checkWorkbenchCommandResult(commandsForSend[1], `"${unicodeValue}"`);
        // Verify that currently selected mode is applied when User re-run the command from history
        await t.click(workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssReRunCommandButton));
        await workbenchPage.checkWorkbenchCommandResult(commandsForSend[1], `"${unicodeValue}"`);
    });
