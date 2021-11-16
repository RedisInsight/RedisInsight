import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    invalidOssStandaloneConfig
} from '../../../helpers/conf';

const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Connecting to the databases verifications`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await myRedisDatabasePage.deleteAllDatabases();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
    })
test('Verify that user can see error message if he can not connect to added Database', async t => {
    //Fill the add database form
    await addRedisDatabasePage.addRedisDataBase(invalidOssStandaloneConfig);
    //Click for saving
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Verify that the database is not in the list
    await t.expect(browserPage.notificationMessage.textContent).eql('Error', 'Error message displaying', { timeout: 60000 });
});
