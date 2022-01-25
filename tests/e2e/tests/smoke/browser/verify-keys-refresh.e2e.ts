import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage} from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();

const keyName = 'Hash1testKeyForRefresh!12344';

fixture `Keys refresh functionality`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can refresh Keys', async t => {
    const keyTTL = '2147476121';
    const newKeyName = 'KeyNameAfterEdit!testKey123456765432';

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
