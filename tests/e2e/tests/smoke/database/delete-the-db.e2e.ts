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

fixture `Delete database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
test
    .meta({ rte: rte.standalone })
    ('Verify that user can delete databases', async t => {
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.deleteAllDatabases();
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).exists).notOk('The database deletion', { timeout: 60000 });
    });
