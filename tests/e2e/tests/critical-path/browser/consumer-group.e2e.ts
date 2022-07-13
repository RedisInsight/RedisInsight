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
const entryIds = [
    '0',
    '$',
    '1654594146318-0'
];

fixture `Consumer group`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async t => {
        //Clear and delete database
        if (await browserPage.closeKeyButton.visible) {
            await t.click(browserPage.closeKeyButton);
        }
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can create a new Consumer Group in the current Stream', async t => {
    const toolTip = [
        'Enter Valid ID, 0 or $',
        '\nSpecify the ID of the last delivered entry in the stream from the new group\'s perspective.',
        '\nOtherwise, ',
        '$',
        'represents the ID of the last entry in the stream,',
        '0',
        'fetches the entire stream from the beginning.'
    ];
    keyName = chance.word({ length: 20 });
    consumerGroupName = `qwerty123456${chance.word({ length: 20 })}!@#$%^&*()_+=`;
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    await t.click(browserPage.fullScreenModeButton);
    // Open Stream consumer groups and add group
    await t.click(browserPage.streamTabGroups);
    await browserPage.createConsumerGroup(consumerGroupName);
    await t.expect(browserPage.streamGroupsContainer.textContent).contains(consumerGroupName, 'The new Consumer Group is added');
    // Verify the tooltip under 'i' element
    await t.click(browserPage.addKeyValueItemsButton);
    await t.hover(browserPage.entryIdInfoIcon);
    for (const text of toolTip) {
        await t.expect(await browserPage.tooltip.innerText).contains(text, 'The toolTip message');
    }
});
test('Verify that user can input the 0, $ and Valid Entry ID in the ID field', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    await t.click(browserPage.fullScreenModeButton);
    // Open Stream consumer groups and add group with different IDs
    await t.click(browserPage.streamTabGroups);
    for (const entryId of entryIds) {
        await browserPage.createConsumerGroup(`${consumerGroupName}${entryId}`, entryId);
        await t.expect(browserPage.streamGroupsContainer.textContent).contains(`${consumerGroupName}${entryId}`, 'The new Consumer Group is added');
    }
});
test('Verify that user can see the Consumer group columns (Group Name, Consumers, Pending, Last Delivered ID)', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    const groupColumns = [
        'Group Name',
        'Consumers',
        'Pending',
        'Last Delivered ID'
    ];
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    await t.click(browserPage.fullScreenModeButton);
    // Open Stream consumer groups and add group with different IDs
    await t.click(browserPage.streamTabGroups);
    await browserPage.createConsumerGroup(consumerGroupName);
    for (let i = 0; i < groupColumns.length; i++) {
        await t.expect(browserPage.scoreButton.nth(i).textContent).eql(groupColumns[i], `The ${i} Consumer group column name`);
    }
});
test('Verify that user can see the message when there are no Consumers in the Consumer Group', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    const message = 'Your Consumer Group has no Consumers available.';
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    // Open Stream consumer group and check message
    await t.click(browserPage.streamTabGroups);
    await browserPage.createConsumerGroup(consumerGroupName);
    await t.click(browserPage.consumerGroup);
    await t.expect(browserPage.streamConsumersContainer.textContent).contains(message, 'The message for empty Consumer Group');
});
test('Verify that user can see the Consumer information columns (Consumer Name, Pendings, Idle Time,ms)', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`
    ];
    const consumerColumns = [
        'Consumer Name',
        'Pending',
        'Idle Time, ms'
    ];
    // Add New Stream Key with groups and consumers
    for(const command of cliCommands){
        await cliPage.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    await t.click(browserPage.consumerGroup);
    for (let i = 0; i < consumerColumns.length; i++) {
        await t.expect(browserPage.scoreButton.nth(i).textContent).eql(consumerColumns[i], `The ${i} Consumers info column name`);
    }
});
test('Verify that user can navigate to Consumer Groups screen using the link in the breadcrumbs', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`
    ];
    // Add New Stream Key with groups and consumers
    for (const command of cliCommands) {
        await cliPage.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    await t.click(browserPage.consumerGroup);
    // Check navigation
    await t.expect(browserPage.streamTabs.visible).ok('Stream navigation tabs visibility');
    await t.click(browserPage.streamTabGroups);
    await t.expect(browserPage.streamTabGroups.withAttribute('aria-selected', 'true').exists).ok('The Consumer Groups screen is opened');
});
test('Verify that user can delete the Consumer from the Consumer Group', async t => {
    keyName = chance.word({ length: 20 });
    let consumerGroupName = chance.word({ length: 20 });
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XADD ${keyName} * message orange`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`,
        `XREADGROUP GROUP ${consumerGroupName} Bob COUNT 1 STREAMS ${keyName} >`
    ];
    // Add New Stream Key with groups and consumers
    for (const command of cliCommands) {
        await cliPage.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    await t.click(browserPage.consumerGroup);
    // Delete consumer and check results
    const consumerCountBefore = await browserPage.streamConsumerName.count;
    await t.click(browserPage.removeConsumerButton);
    await t.expect(browserPage.confirmationMessagePopover.textContent).contains(`will be removed from Consumer Group ${consumerGroupName}`, 'The confirmation message');
    await t.click(browserPage.removeConsumerButton.nth(2));
    await t.expect(browserPage.streamConsumerName.count).eql(consumerCountBefore - 1, 'The Consumers number after deletion');
});
test('Verify that user can delete a Consumer Group', async t => {
    keyName = chance.word({ length: 20 });
    let consumerGroupName = chance.word({ length: 20 });
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`
    ];
    // Add New Stream Key with groups and consumers
    for (const command of cliCommands) {
        await cliPage.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    // Delete consumer group and check results
    await t.click(browserPage.removeConsumerGroupButton);
    await t.expect(browserPage.confirmationMessagePopover.textContent).contains(`${consumerGroupName}and all its consumers will be removed from ${keyName}`, 'The confirmation message');
    await t.click(browserPage.removeConsumerGroupButton.nth(1));
    await t.expect(browserPage.streamGroupsContainer.textContent).contains('Your Key has no Consumer Groups available.', 'The Consumer Group is removed from the table');
});
test('Verify that user can change the ID set for the Consumer Group when click on the Pencil button', async t => {
    keyName = chance.word({ length: 20 });
    let consumerGroupName = chance.word({ length: 20 });
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`
    ];
    // Add New Stream Key with groups and consumers
    for (const command of cliCommands) {
        await cliPage.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    // Change the ID set for the Consumer Group
    for (const id of entryIds) {
        const idBefore = await browserPage.streamGroupId.textContent;
        await t.click(browserPage.editStreamLastIdButton);
        await t.typeText(browserPage.lastIdInput, id, { replace: true });
        await t.click(browserPage.saveButton);
        await t.expect(browserPage.streamGroupId.textContent).notEql(idBefore, 'The last delivered ID is modified and the table is reloaded');
    }
});
