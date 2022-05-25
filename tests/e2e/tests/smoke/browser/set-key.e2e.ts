import { Chance } from 'chance';
import { acceptTermsAddDatabaseOrConnectToRedisStack, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });
const keyTTL = '2147476121';
const keyMember = '1111setMember11111';

fixture `Set Key fields verification`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptTermsAddDatabaseOrConnectToRedisStack(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can add member to Set', async t => {
        keyName = chance.word({ length: 10 });
        await browserPage.addSetKey(keyName, keyTTL);
        //Add member to the Set key
        await browserPage.addMemberToSet(keyMember);
        //Check the added member
        await t.expect(browserPage.setMembersList.withExactText(keyMember).exists).ok('The existence of the set member', { timeout: 10000 });
    });
test
    .meta({ rte: rte.standalone })('Verify that user can remove member from Set', async t => {
        keyName = chance.word({ length: 10 });
        await browserPage.addSetKey(keyName, keyTTL);
        //Add member to the Set key
        await browserPage.addMemberToSet(keyMember);
        //Remove member from the key
        await t.click(browserPage.removeSetMemberButton);
        await t.click(browserPage.confirmRemoveSetMemberButton);
        //Check the notification message
        const notification = await browserPage.getMessageText();
        await t.expect(notification).contains('Member has been removed', 'The notification');
    });
