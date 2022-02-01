import { commonUrl } from '../../../helpers/conf';
import { UserAgreementPage, AddRedisDatabasePage, SettingsPage } from '../../../pageObjects';
import { Common } from '../../../helpers/common';

const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const settingsPage = new SettingsPage();
const common = new Common();

fixture `Agreements Verification`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .requestHooks(common.mock)
    .beforeEach(async t => {
        await t.maximizeWindow();
    });
test
    .meta({ env: 'web', rte: 'none' })
    ('Verify that user should accept User Agreements to continue working with the application, the Welcome page is opened after user agrees, the encryption enabled by default and specific message', async t => {
        await t.expect(userAgreementPage.userAgreementsPopup.exists).ok('User Agreements Popup is shown');
        //Verify that section with plugin warning is displayed
        await t.expect(userAgreementPage.pluginSectionWithText.visible).ok('Plugin text is displayed');
        //Verify that text that is displayed in window is 'While adding new visualization plugins, use files only from trusted authors to avoid automatic execution of malicious code.'
        const pluginText = userAgreementPage.pluginSectionWithText.innerText;
        await t.expect(pluginText).eql('While adding new visualization plugins, use files only from trusted authors to avoid automatic execution of malicious code.');
        // Verify that encryption enabled by default
        await t.expect(userAgreementPage.switchOptionEncryption.withAttribute('aria-checked', 'true').exists).ok('Encryption enabled by default');
        await t.click(addRedisDatabasePage.addDatabaseButton);
        //Verify that I still has agreements popup & cannot add a database
        await t.expect(userAgreementPage.userAgreementsPopup.exists).ok('User Agreements Popup is shown');
        await t.expect(addRedisDatabasePage.addDatabaseManually.exists).notOk('User can\'t add a database');
        //Accept agreements
        await t.click(settingsPage.switchEulaOption);
        await t.click(settingsPage.submitConsentsPopupButton);
        //Verify that I dont have an popup
        await t.expect(userAgreementPage.userAgreementsPopup.exists).notOk('User Agreements Popup isn\'t shown after accept agreements');
        //Verify that Welcome page is displayed
        await t.expect(addRedisDatabasePage.welcomePageTitle.exists).ok('Welcome page is displayed');
        //Verify I can work with the application
        await t.click(addRedisDatabasePage.addDatabaseButton);
        await t.expect(addRedisDatabasePage.addDatabaseManually.exists).ok('User can add a database');
    });
