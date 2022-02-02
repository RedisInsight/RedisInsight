import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    WorkbenchPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const speed = 0.4;

fixture `Workbench Context`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await myRedisDatabasePage.deleteAllDatabases();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see saved input in Editor when navigates away to any other page', async t => {
        const command = 'FT.CREATE products ON HASH PREFIX 1 product: SCHEMA name TEXT';
        //Enter the command in the Workbench editor and navigate to Browser
        await t.typeText(workbenchPage.queryInput, command, { replace: true, speed: speed});
        await t.click(myRedisDatabasePage.browserButton);
        //Return back to Workbench and check input in editor
        await t.click(myRedisDatabasePage.workbenchButton);
        await t.expect((await workbenchPage.queryInputScriptArea.textContent).replace(/\s/g, ' ')).eql(command, 'Input in Editor is saved');
    });
