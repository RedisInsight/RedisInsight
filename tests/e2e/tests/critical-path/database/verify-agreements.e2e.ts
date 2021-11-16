import { RequestMock } from 'testcafe';
import { commonUrl } from '../../../helpers/conf';
import { UserAgreementPage, AddRedisDatabasePage, SettingsPage } from '../../../pageObjects';

const addRedisDatabasePage = new AddRedisDatabasePage();
const settingsPage = new SettingsPage();

const mockedSettingsResponse = {
    agreements: {
        version: '0',
        eula: false,
        analytics: false
    }
};
const settingsApiUrl = `${commonUrl}/api/settings`;

const mock = RequestMock()
    .onRequestTo(settingsApiUrl)
    .respond(mockedSettingsResponse, 200);

const userAgreementPage = new UserAgreementPage();

fixture `Agreements Verification`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .requestHooks(mock)
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
