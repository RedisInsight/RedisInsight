import { acceptTermsAddDatabaseOrConnectToRedisStack, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();

let keyName = Common.generateWord(10);
const keyTTL = '2147476121';
const keyMember = '1111setMember11111';

fixture `Set Key fields verification`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptTermsAddDatabaseOrConnectToRedisStack(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that user can remove member from Set', async t => {
    keyName = Common.generateWord(10);
    await browserPage.addSetKey(keyName, keyTTL);
    // Add member to the Set key
    await browserPage.addMemberToSet(keyMember);
    // Verify that user can add member to Set
    await t.expect(browserPage.setMembersList.withExactText(keyMember).exists).ok('The set member not found', { timeout: 10000 });

    // Remove member from the key
    await t.click(browserPage.removeSetMemberButton);
    await t.click(browserPage.confirmRemoveSetMemberButton);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Member has been removed', 'The notification not found');
});
