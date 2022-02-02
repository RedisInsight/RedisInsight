import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    CliPage,
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
const cliPage = new CliPage();

fixture `Database overview`
    .meta({type: 'regression'})
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
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see total memory and total number of keys updated in DB header in Workbench page', async t => {
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Create new keys
        await cliPage.addKeysFromCli('MSET', 10);
        //Open Workbench
        await t.click(myRedisDatabasePage.workbenchButton);
        //Verify that user can see total memory and total number of keys
        await t.expect(workbenchPage.overviewTotalKeys.exists).ok('User can see total keys');
        await t.expect(workbenchPage.overviewTotalMemory.exists).ok('User can see total memory');
    });
