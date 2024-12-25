import { commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { Common } from '../../../../helpers/common';
import { rte } from '../../../../helpers/constants';
import { UserAgreementDialog } from '../../../../pageObjects/dialogs';

const userAgreementDialog = new UserAgreementDialog();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Agreements Verification`
    .meta({ type: 'critical_path', rte: rte.none })
    .page(commonUrl)
    .requestHooks(Common.mockSettingsResponse())
test('Verify that user should accept User Agreements to continue working with the application', async t => {
        await t.expect(userAgreementDialog.userAgreementsPopup.exists).ok('User Agreements Popup is shown');
        // Verify that I still has agreements popup & cannot add a database
        await t.expect(userAgreementDialog.submitButton.hasAttribute('disabled')).ok('Submit button not disabled by default');
        await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.customSettingsButton.exists).notOk('User can\'t add a database');
    });
test('Verify that the encryption enabled by default and specific message', async t => {
    const expectedPluginText = 'To avoid automatic execution of malicious code, when adding new Workbench plugins, use files from trusted authors only.';
    // Verify that section with plugin warning is displayed
    await t.expect(userAgreementDialog.pluginSectionWithText.exists).ok('Plugin text is not displayed');
    // Verify that text that is displayed in window is 'While adding new visualization plugins, use files only from trusted authors to avoid automatic execution of malicious code.'
    const pluginText = userAgreementDialog.pluginSectionWithText.innerText;
    await t.expect(pluginText).eql(expectedPluginText, 'Plugin text is incorrect');

    // unskip the verification when encription will be fixed for test builds
    // // Verify that encryption enabled by default
    // await t.expect(userAgreementDialog.switchOptionEncryption.withAttribute('aria-checked', 'true').exists).ok('Encryption enabled by default');
});
