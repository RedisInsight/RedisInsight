import { Chance } from 'chance';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const chance = new Chance();

let keyName = chance.word({ length: 20 });
let consumerGroupName = chance.word({ length: 20 });
const keyField = chance.word({ length: 20 });
const keyValue = chance.word({ length: 20 });

fixture `Consumer group`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async t => {
        //Clear and delete database
        if (await browserPage.closeKeyButton.visible){
            await t.click(browserPage.closeKeyButton);
        }
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that when user enter invalid Group Name the error message appears', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    const error = 'BUSYGROUP Consumer Group name already exists';
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
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
test('Verify that A>Z is default table sorting in Consumer column', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    const consumerNames = [
        'Alice',
        'Zalice'
    ];
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XADD ${keyName} * message orange`,
        `XREADGROUP GROUP ${consumerGroupName} ${consumerNames[0]} COUNT 1 STREAMS ${keyName} >`,
        `XREADGROUP GROUP ${consumerGroupName} ${consumerNames[1]} COUNT 1 STREAMS ${keyName} >`
    ];
    //Add New Stream Key with groups and consumers
    for(const command of cliCommands){
        await cliPage.sendCommandInCli(command);
    }
    //Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    await t.click(browserPage.consumerGroup);
    //Verify default sorting
    const consumerCount = await browserPage.streamConsumerName.count;
    for(let i = 0; i < consumerCount; i++){
        await t.expect(browserPage.streamConsumerName.nth(i).textContent).contains(consumerNames[i], 'The Consumers default sorting');
    }
});
test('Verify that user can see error message if enter invalid last delivered ID', async t => {
    keyName = chance.word({ length: 20 });
    let consumerGroupName = chance.word({ length: 20 });
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`
    ];
    const invalidEntryIds = [
        '!@#%^&*()_',
        '12345678901242532366121324'
    ];
    const errorMessage = 'ID format is not correct';
    // Add New Stream Key with groups and consumers
    for(const command of cliCommands){
        await cliPage.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    // Change the ID set for the Consumer Group
    for(const id of invalidEntryIds){
        const idBefore = await browserPage.streamGroupId.textContent;
        await t.click(browserPage.editStreamLastIdButton);
        await t.typeText(browserPage.lastIdInput, id, { replace: true });
        await t.click(browserPage.saveButton);
        await t.expect(browserPage.streamGroupId.textContent).eql(idBefore, 'The last delivered ID is not modified');
        await t.expect(browserPage.entryIdError.textContent).eql(errorMessage, 'The error message');
    }
});
