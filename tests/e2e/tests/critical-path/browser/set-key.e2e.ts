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
    .meta({ type: 'critical_path' })
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
test('Verify that user can search by part member name with pattern * in Set', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await browserPage.addSetKey(keyName, keyTTL, '1111');
    //Add member to the Set key
    await browserPage.addMemberToSet(keyMember);
    //Search by part member name in the end
    await browserPage.searchByTheValueInSetKey('1111set*');
    //Check the search result
    let result = await browserPage.setMembersList.nth(0).textContent;
    await t.expect(result).eql(keyMember, 'The set member');
    //Search by part member name in the beggining
    await browserPage.searchByTheValueInSetKey('*Member11111');
    //Check the search result
    result = await browserPage.setMembersList.nth(0).textContent;
    await t.expect(result).eql(keyMember, 'The set member');
    //Search by part member name in the middle
    await browserPage.searchByTheValueInSetKey('1111*11111');
    //Check the search result
    result = await browserPage.setMembersList.nth(0).textContent;
    await t.expect(result).eql(keyMember, 'The set member');
});
test('Verify that user can search by full member name in Set', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await browserPage.addSetKey(keyName, keyTTL, '1111');
    //Add member to the Set key
    await browserPage.addMemberToSet(keyMember);
    //Search by full member name
    await browserPage.searchByTheValueInSetKey(keyMember);
    //Check the search result
    const result = await browserPage.setMembersList.nth(0).textContent;
    await t.expect(result).eql(keyMember, 'The set member');
});
