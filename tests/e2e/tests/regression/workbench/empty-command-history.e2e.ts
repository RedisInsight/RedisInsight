import { Selector } from 'testcafe';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

fixture `Empty command history in Workbench`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can see placeholder text in Workbench history if no commands have not been run yet', async t => {
    //Verify that all the elements from empty command history placeholder are displayed
    await t.expect(workbenchPage.noCommandHistorySection.visible).ok('No command history section is visible')
    await t.expect(workbenchPage.noCommandHistoryIcon.visible).ok('No command history icon is visible')
    await t.expect(workbenchPage.noCommandHistoryTitle.visible).ok('No command history title is visible')
    await t.expect(workbenchPage.noCommandHistoryText.visible).ok('No command history text is visible')
    //Run a command
    const commandToSend = 'info server';
    await workbenchPage.sendCommandInWorkbench(commandToSend);
    //Verify that empty command history placeholder is not displayed
    await t.expect(workbenchPage.noCommandHistorySection.visible).notOk('No command history section is not visible')
    //Delete the command result
    await t.click(Selector(workbenchPage.cssDeleteCommandButton));
    //Verify that empty command history placeholder is displayed
    await t.expect(workbenchPage.noCommandHistorySection.visible).ok('No command history section is visible')
});
