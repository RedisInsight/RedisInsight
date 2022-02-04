import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage} from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });
let newKeyName = chance.word({ length: 10 });

fixture `Keys refresh functionality`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(newKeyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can refresh Keys', async t => {
    keyName = chance.word({ length: 10 });
    const keyTTL = '2147476121';
    newKeyName = chance.word({ length: 10 });

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
