import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `Set Key fields verification`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async() => {
        await browserPage.deleteKey();
    })
    const keyName = 'Set1testKeyForAddMember';
    const keyTTL = '2147476121';
    const keyMember = '1111setMember11111';
test('Verify that user can add member to Set', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await browserPage.addSetKey(keyName, keyTTL);
    //Add member to the Set key
    await browserPage.addMemberToSet(keyMember);
    //Check the added member
    await t.expect(browserPage.setMembersList.withExactText(keyMember).exists).ok('The existence of the set member', { timeout: 20000 });
});
test('Verify that user can remove member from Set', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await browserPage.addSetKey(keyName, keyTTL);
    //Add member to the Set key
    await browserPage.addMemberToSet(keyMember);
    //Remove member from the key
    await t.click(browserPage.removeButton);
    await t.click(browserPage.confirmRemoveSetMemberButton);
    //Check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Member has been removed', 'The notification');
});
