import { commonUrl } from '../../../helpers/conf';
import { UserAgreementPage } from '../../../pageObjects';
import { Common } from '../../../helpers/common';

const userAgreementPage = new UserAgreementPage();
const common = new Common();

fixture `Agreements Verification`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .requestHooks(common.mock)
    .beforeEach(async t => {
        await t.maximizeWindow();
    });
test('Verify that user can see specific message on EULA and Privacy Settings window during the first app launch', async t => {
    //Verify that User Agreements modal form is displayed
    await t.expect(userAgreementPage.userAgreementsPopup.exists).ok('User Agreements Popup is shown');
    //Verify that section with plugin warning is displayed
    await t.expect(userAgreementPage.pluginSectionWithText.visible).ok('Plugin text is displayed');
    //Verify that text that is displayed in window is 'While adding new visualization plugins, use files only from trusted authors to avoid automatic execution of malicious code.'
    const pluginText = userAgreementPage.pluginSectionWithText.innerText;
    await t.expect(pluginText).eql('While adding new visualization plugins, use files only from trusted authors to avoid automatic execution of malicious code.');
});
