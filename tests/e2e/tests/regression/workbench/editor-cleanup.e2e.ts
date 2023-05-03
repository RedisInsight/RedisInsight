import { acceptLicenseTerms, acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { WorkbenchPage, MyRedisDatabasePage, SettingsPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { addNewStandaloneDatabasesApi, deleteStandaloneDatabaseApi, deleteStandaloneDatabasesApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const settingsPage = new SettingsPage();

const commandToSend = 'info server';
const databasesForAdding = [
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: 'testDB1' },
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: 'testDB2' }
];

fixture `Workbench Editor Cleanup`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Clear and delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Disabled Editor Cleanup toggle behavior', async t => {
    // Go to Settings page
    await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
    await t.click(settingsPage.accordionWorkbenchSettings);
    // Disable Editor Cleanup
    await t.click(settingsPage.switchEditorCleanupOption);
    // Verify that user can see text "Clear the Editor after running commands" for Editor Cleanup In Settings
    await t.expect(settingsPage.switchEditorCleanupOption.sibling(0).withExactText('Clear the Editor after running commands').visible).ok('Cleanup text is not correct');
    // Go to Workbench page
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    // Send commands
    await workbenchPage.sendCommandInWorkbench(commandToSend);
    await workbenchPage.sendCommandInWorkbench(commandToSend);
    // Verify that Editor input is not affected after user running command
    await t.expect((await workbenchPage.queryInputScriptArea.textContent).replace(/\s/g, ' ')).eql(commandToSend, 'Input in Editor is saved');
});
test('Enabled Editor Cleanup toggle behavior', async t => {
    // Go to Workbench page
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    // Send commands
    await workbenchPage.sendCommandInWorkbench(commandToSend);
    await workbenchPage.sendCommandInWorkbench(commandToSend);
    // Verify that Editor input is cleared after running command
    await t.expect(await workbenchPage.queryInputScriptArea.textContent).eql('', 'Input in Editor is saved');
});
test
    .before(async() => {
        // Add new databases using API
        await acceptLicenseTerms();
        await addNewStandaloneDatabasesApi(databasesForAdding);
        // Reload Page
        await myRedisDatabasePage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[0].databaseName);
    })
    .after(async() => {
        // Clear and delete database
        await deleteStandaloneDatabasesApi(databasesForAdding);
    })('Editor Cleanup settings', async t => {
        // Go to Settings page
        await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
        await t.click(settingsPage.accordionWorkbenchSettings);
        // Disable Editor Cleanup
        await settingsPage.changeEditorCleanupSwitcher(false);
        await myRedisDatabasePage.reloadPage();
        await t.click(settingsPage.accordionWorkbenchSettings);
        // Verify that Editor Cleanup setting is saved when refreshing the page
        await t.expect(await settingsPage.getEditorCleanupSwitcherValue()).notOk('Editor Cleanup switcher changed');
        // Go to another database
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[1].databaseName);
        // Go to Settings page
        await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
        await t.click(settingsPage.accordionWorkbenchSettings);
        // Verify that Editor Cleanup setting is saved when switching between databases
        await t.expect(await settingsPage.getEditorCleanupSwitcherValue()).notOk('Editor Cleanup switcher changed');
    });
