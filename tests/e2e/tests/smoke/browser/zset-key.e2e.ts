import { rte } from '../../../helpers/constants';
import { acceptTermsAddDatabaseOrConnectToRedisStack, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();

let keyName = Common.generateWord(10);
const keyTTL = '2147476121';
const keyMember = '1111ZsetMember11111';
const score = '0';

fixture `ZSet Key fields verification`
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
test('Verify that user can remove member from ZSet', async t => {
    keyName = Common.generateWord(10);
    await browserPage.addZSetKey(keyName, '6', keyTTL);
    // Add member to the ZSet key
    await browserPage.addMemberToZSet(keyMember, score);
    // Verify that user can add members to Zset
    await t.expect(browserPage.zsetMembersList.withExactText(keyMember).exists).ok('The Zset member not found', { timeout: 10000 });
    await t.expect(browserPage.zsetScoresList.withExactText(score).exists).ok('The Zset score not found', { timeout: 10000 });

    // Remove member from the key
    await t.click(browserPage.removeZserMemberButton);
    await t.click(browserPage.confirmRemovZSetMemberButton);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Member has been removed', 'The notification not found');
});
