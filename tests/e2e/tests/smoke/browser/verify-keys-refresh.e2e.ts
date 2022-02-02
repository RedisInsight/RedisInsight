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
import { rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

const keyName = 'Hash1testKeyForRefresh!12344';

fixture `Keys refresh functionality`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
    })

test
    .meta({ rte: rte.standalone })
    .after(async() => {
        await browserPage.deleteKeyByName(keyName);
    })('Verify that user can refresh Keys', async t => {
        const keyTTL = '2147476121';
        const newKeyName = 'KeyNameAfterEdit!testKey123456765432';

        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //add hash key
        await browserPage.addHashKey(keyName, keyTTL);
        const notofication = await browserPage.getMessageText();
        await t.expect(notofication).contains('Key has been added', 'The notification');
        await t.click(browserPage.closeKeyButton);
        //search for the added key
        await browserPage.searchByKeyName(keyName);
        await t.expect(browserPage.keyNameInTheList.withExactText(keyName).exists).ok('The key is in the list', { timeout: 20000 });
        //edit the key name
        await t.click(browserPage.keyNameInTheList);
        await browserPage.editKeyName(newKeyName);
        //refresh Keys and check
        await t.click(browserPage.refreshKeysButton);
        await browserPage.searchByKeyName(keyName);
        await t.expect(browserPage.keyNameInTheList.withExactText(keyName).exists).notOk('The key is not in the list', { timeout: 20000 });
    });
