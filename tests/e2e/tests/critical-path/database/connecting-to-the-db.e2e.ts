import { BrowserPage, AddRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, invalidOssStandaloneConfig } from '../../../helpers/conf';
import { acceptLicenseTerms } from '../../../helpers/database';

const addRedisDatabasePage = new AddRedisDatabasePage();
const browserPage = new BrowserPage();

fixture `Connecting to the databases verifications`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTerms();
    })
test('Verify that user can see error message if he can not connect to added Database', async t => {
    //Fill the add database form
    await addRedisDatabasePage.addRedisDataBase(invalidOssStandaloneConfig);
    //Click for saving
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Verify that the database is not in the list
    await t.expect(browserPage.notificationMessage.textContent).eql('Error', 'Error message displaying', { timeout: 60000 });
});
