import { commonUrl } from '../../../helpers/conf';
import { UserAgreementPage, AddRedisDatabasePage, SettingsPage } from '../../../pageObjects';
import { Common } from '../../../helpers/common';

const addRedisDatabasePage = new AddRedisDatabasePage();
const settingsPage = new SettingsPage();
const common = new Common();
const userAgreementPage = new UserAgreementPage();

fixture `Agreements Verification`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .requestHooks(common.mock)
    .beforeEach(async t => {
        await t.maximizeWindow();
    });
test('Verify that user should accept User Agreements to continue working with the application', async t => {
    await t.expect(userAgreementPage.userAgreementsPopup.exists).ok('User Agreements Popup is shown');
    await t.click(addRedisDatabasePage.addDatabaseButton);
    //Verify that I still has agreements popup & cannot add a database
    await t.expect(userAgreementPage.userAgreementsPopup.exists).ok('User Agreements Popup is shown');
    await t.expect(addRedisDatabasePage.addDatabaseManually.exists).notOk('User can\'t add a database');
    //Accept agreements
    await t.click(settingsPage.switchEulaOption);
    await t.click(settingsPage.submitConsentsPopupButton);
    //Verify that I dont have an popup
    await t.expect(userAgreementPage.userAgreementsPopup.exists).notOk('User Agreements Popup isn\'t shown after accept agreements');
    //Verify I can work with the application
    await t.click(addRedisDatabasePage.addDatabaseButton);
    await t.expect(addRedisDatabasePage.addDatabaseManually.exists).ok('User can add a database');
});
test('Verify that user when user agrees to RI terms and conditions with encryption enabled, user is redirected to the Welcome page', async t => {
    //Click on "I have read and understood the Server Side Public License" and submit
    await t.click(settingsPage.switchEulaOption);
    await t.click(settingsPage.submitConsentsPopupButton);
    //Verify that Welcome page is displayed
    await t.expect(addRedisDatabasePage.welcomePageTitle.exists).ok('Welcome page is displayed');
});
test('Verify that user when user agrees to RI terms and conditions with encryption enabled, user is redirected to the Welcome page', async t => {
    // Verify that encryption enabled by default
    await t.expect(userAgreementPage.switchOptionEncryption.withAttribute('aria-checked', 'true').exists).ok('Encryption enabled by default');
});
