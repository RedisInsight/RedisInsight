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
const keyField = chance.word({ length: 20 });
const keyValue = chance.word({ length: 20 });

fixture `Consumer group`
    .meta({ type: 'critical_path', rte: rte.standalone })
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
    const consumerGroupName = `qwerty123456${chance.word({ length: 20 })}!@#$%^&*()_+=`;
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
    for(const text of toolTip){
        await t.expect(await browserPage.tooltip.innerText).contains(text, 'The toolTip message');
    }
});
test('Verify that user can input the 0, $ and Valid Entry ID in the ID field', async t => {
    keyName = chance.word({ length: 20 });
    const consumerGroupName = chance.word({ length: 20 });
    const entryIds = [
        '0',
        '$',
        '1654594146318-0'
    ];
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    await t.click(browserPage.fullScreenModeButton);
    // Open Stream consumer groups and add group with different IDs
    await t.click(browserPage.streamTabGroups);
    for(const entryId of entryIds){
        await browserPage.createConsumerGroup(`${consumerGroupName}${entryId}`, entryId);
        await t.expect(browserPage.streamGroupsContainer.textContent).contains(`${consumerGroupName}${entryId}`, 'The new Consumer Group is added');
    }
});
