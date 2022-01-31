import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const chance = new Chance();

const speed = 0.4;
let indexName = chance.word({ length: 5 });

fixture `Workbench Context`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async () => {
        //Drop index, documents and database
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can see saved input in Editor when navigates away to any other page', async t => {
    indexName = chance.word({ length: 5 });
    const command = `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA name TEXT`;
    //Enter the command in the Workbench editor and navigate to Browser
    await t.typeText(workbenchPage.queryInput, command, { replace: true, speed: speed});
    await t.click(myRedisDatabasePage.browserButton);
    //Return back to Workbench and check input in editor
    await t.click(myRedisDatabasePage.workbenchButton);
    await t.expect((await workbenchPage.queryInputScriptArea.textContent).replace(/\s/g, ' ')).eql(command, 'Input in Editor is saved');
});
