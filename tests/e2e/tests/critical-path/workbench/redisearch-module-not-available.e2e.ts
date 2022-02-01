import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    WorkbenchPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneV5Config
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const commandForSend = 'FT._LIST';

fixture `Redisearch module not available`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneV5Config);
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
test
    .meta({ rte: 'standalone' })
    ('Verify that user can see the information message that the RediSearch module is not available when he runs any input with "FT." prefix in Workbench', async t => {
        //Send command with 'FT.'
        await workbenchPage.sendCommandInWorkbench(commandForSend);
        //Verify the information message
        await t.expect(await workbenchPage.queryCardNoModuleOutput.textContent).eql('RediSearch module is not loaded for this database', 'The information message');
    });
