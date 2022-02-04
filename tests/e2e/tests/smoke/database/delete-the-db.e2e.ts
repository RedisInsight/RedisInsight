import { addNewStandaloneDatabase } from '../../../helpers/database';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTerms } from '../../../helpers/database';
import { MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Delete database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTerms();
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can delete databases', async t => {
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.deleteDatabaseByName(ossStandaloneConfig.databaseName);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).exists).notOk('The database deletion', { timeout: 60000 });
    });
