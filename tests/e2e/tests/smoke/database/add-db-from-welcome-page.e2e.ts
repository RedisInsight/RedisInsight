import { addNewStandaloneDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, UserAgreementPage, AddRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `Add database from welcome page`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can add first DB from Welcome page', async t => {
        //Delete all the databases to open Welcome page
        await myRedisDatabasePage.deleteAllDatabases();
        await t.expect(addRedisDatabasePage.welcomePageTitle.exists).ok('The welcome page title');
        //Add database from Welcome page
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).exists).ok('The database adding', { timeout: 60000 });
    });
