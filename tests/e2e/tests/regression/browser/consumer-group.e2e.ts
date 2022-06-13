import { Chance } from 'chance';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 20 });
let consumerGroupName = chance.word({ length: 20 });
const keyField = chance.word({ length: 20 });
const keyValue = chance.word({ length: 20 });

fixture `Consumer group`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async t => {
        //Clear and delete database
        if (t.expect(browserPage.closeKeyButton.visible).ok){
            await t.click(browserPage.closeKeyButton);
        }
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that when user enter invalid Group Name the error message appears', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    const error = 'BUSYGROUP Consumer Group name already exists';
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    await t.click(browserPage.fullScreenModeButton);
    // Open Stream consumer groups and add group
    await t.click(browserPage.streamTabGroups);
    await browserPage.createConsumerGroup(consumerGroupName);
    // Verify the error message
    await t.click(browserPage.streamTabGroups);
    await browserPage.createConsumerGroup(consumerGroupName);
    await t.expect(browserPage.errorMessage.textContent).contains(error, 'The error message that the Group name already exists');
});
test('Verify that when user enter invalid format ID the error message appears', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    const error = 'ID format is not correct';
    const invalidEntryIds = [
        'qwerty12344545',
        '16545941463181654594146318'
    ];
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    await t.click(browserPage.fullScreenModeButton);
    // Open Stream consumer groups and enter invalid EntryIds
    await t.click(browserPage.streamTabGroups);
    await t.click(browserPage.addKeyValueItemsButton);
    for(const entryId of invalidEntryIds){
        await t.typeText(browserPage.consumerIdInput, entryId, { replace: true, paste: true });
        await t.click(browserPage.saveGroupsButton);
        await t.expect(browserPage.entryIdError.textContent).eql(error, 'The invalid Id error message');
    }
});
test('Verify that user can see the message when there are no Consumer Groups', async t => {
    keyName = chance.word({ length: 20 });
    const message = 'Your Key has no Consumer Groups available.';
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    // Open Stream consumer groups and check message
    await t.click(browserPage.streamTabGroups);
    await t.expect(browserPage.streamGroupsContainer.textContent).contains(message, 'The Consumer Groups message');
});
test('Verify that user can sort Consumer Group column: A>Z / Z>A(A>Z is default table sorting)', async t => {
    keyName = chance.word({ length: 20 });
    const consumerGroupNames = [
        'agroup',
        'bgroup',
        'zgroup'
    ];
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    // Open Stream consumer groups and add few groups
    await t.click(browserPage.streamTabGroups);
    for(const group of consumerGroupNames){
        await browserPage.createConsumerGroup(group);
    }
    //Verify default sorting
    const groupsCount = await browserPage.streamGroupName.count;
    for(let i = 0; i < groupsCount; i++){
        await t.expect(browserPage.streamGroupName.nth(i).textContent).contains(consumerGroupNames[i], 'The Consumer Groups default sorting');
    }
    //Verify the Z>A sorting
    await t.click(browserPage.scoreButton.nth(0));
    for(let i = 0; i < groupsCount; i++){
        await t.expect(browserPage.streamGroupName.nth(i).textContent).contains(consumerGroupNames[groupsCount - 1 - i], 'The Consumer Groups Z>A sorting');
    }
});
