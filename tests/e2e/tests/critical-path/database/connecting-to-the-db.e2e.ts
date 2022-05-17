import { rte } from '../../../helpers/constants';
import { AddRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, invalidOssStandaloneConfig } from '../../../helpers/conf';
import { acceptLicenseTerms } from '../../../helpers/database';

const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `Connecting to the databases verifications`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    });
test
    .meta({ rte: rte.none })('Verify that user can see error message if he can not connect to added Database', async t => {
        //Fill the add database form
        await addRedisDatabasePage.addRedisDataBase(invalidOssStandaloneConfig);
        //Click for saving
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        //Verify that the database is not in the list
        await t.expect(addRedisDatabasePage.errorMessage.textContent).contains('Error', 'Error message displaying', { timeout: 10000 });
        await t.expect(addRedisDatabasePage.errorMessage.textContent).contains(`Could not connect to ${invalidOssStandaloneConfig.host}:${invalidOssStandaloneConfig.port}, please check the connection details.`, 'Error message displaying', { timeout: 10000 });
    });
