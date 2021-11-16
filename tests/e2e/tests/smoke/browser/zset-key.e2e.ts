import { addNewStandaloneDatabase } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
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

fixture `ZSet Key fields verification`
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
    const keyName = 'ZSet1testKeyForAddMember';
    const keyTTL = '2147476121';
    const keyMember = '1111ZsetMember11111';
    const score = '0';
test('Verify that user can add members to Zset', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await browserPage.addZSetKey(keyName, '5', keyTTL);
    //Add member to the ZSet key
    await browserPage.addMemberToZSet(keyMember, score);
    //Check the added member
    await t.expect(browserPage.zsetMembersList.withExactText(keyMember).exists).ok('The existence of the Zset member', { timeout: 20000 });
    await t.expect(browserPage.zsetScoresList.withExactText(score).exists).ok('The existence of the Zset score', { timeout: 20000 });
});
test('Verify that user can remove member from ZSet', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await browserPage.addZSetKey(keyName, '6', keyTTL);
    //Add member to the ZSet key
    await browserPage.addMemberToZSet(keyMember, score);
    //Remove member from the key
    await t.click(browserPage.removeButton);
    await t.click(browserPage.confirmRemovZSetMemberButton);
    //Check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Member has been removed', 'The notification');
});
