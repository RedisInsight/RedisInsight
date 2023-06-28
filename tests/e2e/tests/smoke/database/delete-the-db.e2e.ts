import { Chance } from 'chance';
import { addNewStandaloneDatabase, acceptLicenseTerms } from '../../../helpers/database';
import { rte } from '../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
const chance = new Chance();

const myRedisDatabasePage = new MyRedisDatabasePage();
const uniqueId = chance.string({ length: 10 });
let database = {
    ...ossStandaloneConfig,
    databaseName: `test_standalone-${uniqueId}`
};

fixture `Delete database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
        database = {
            ...ossStandaloneConfig,
            databaseName: `test_standalone-${uniqueId}`
        };
    });
test
    .meta({ rte: rte.standalone })('Verify that user can delete databases', async t => {
        await addNewStandaloneDatabase(database);
        await myRedisDatabasePage.deleteDatabaseByName(database.databaseName);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(database.databaseName).exists).notOk('The database not deleted', { timeout: 10000 });
    });
