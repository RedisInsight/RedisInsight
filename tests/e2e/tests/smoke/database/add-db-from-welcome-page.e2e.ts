import { rte } from '../../../helpers/constants';
import { acceptLicenseTerms, addNewStandaloneDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, AddRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `Add database from welcome page`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTerms();
    })
    .afterEach(async () => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
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
