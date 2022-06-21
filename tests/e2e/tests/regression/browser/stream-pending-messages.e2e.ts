import { Chance } from 'chance';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const chance = new Chance();

let keyName = chance.word({ length: 20 });
let consumerGroupName = chance.word({ length: 20 });

fixture `Pending messages`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async t => {
        //Clear and delete database
        if (await t.expect(browserPage.closeKeyButton.visible).ok()){
            await t.click(browserPage.closeKeyButton);
        }
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that user can\'t select currently selected Consumer to Claim message in the drop-down', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    const consumerNames = [
        'Alice',
        'Bob'
    ];
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XADD ${keyName} * message orange`,
        `XREADGROUP GROUP ${consumerGroupName} ${consumerNames[0]} COUNT 1 STREAMS ${keyName} >`,
        `XREADGROUP GROUP ${consumerGroupName}  ${consumerNames[1]} COUNT 1 STREAMS ${keyName} >`
    ];
    // Add New Stream Key with pending message
    for(const command of cliCommands){
        await cliPage.sendCommandInCli(command);
    }
    // Open Stream pendings view
    await browserPage.openStreamPendingsView(keyName);
    await t.click(browserPage.fullScreenModeButton);
    // Click on Claim message and check result
    await t.click(browserPage.claimPendingMessageButton);
    await t.click(browserPage.consumerDestinationSelect);
    await t.expect(browserPage.consumerOption.textContent).notContains(consumerNames[0], 'The currently selected Consumer is not in the drop-down');
});
test('Verify that the message is claimed only if its idle time is greater than the Min Idle Time', async t => {
    keyName = chance.word({ length: 20 });
    consumerGroupName = chance.word({ length: 20 });
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XADD ${keyName} * message orange`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`,
        `XREADGROUP GROUP ${consumerGroupName} Bob COUNT 1 STREAMS ${keyName} >`
    ];
    // Add New Stream Key with pending message
    for(const command of cliCommands){
        await cliPage.sendCommandInCli(command);
    }
    // Open Stream pendings view
    await browserPage.openStreamPendingsView(keyName);
    await t.click(browserPage.fullScreenModeButton);
    const streamMessageBefore = await browserPage.streamMessage.count;
    // Claim message and check result when Min Idle Time is greater than the idle time
    await t.click(browserPage.claimPendingMessageButton);
    await t.typeText(browserPage.streamMinIdleTimeInput, '100000000');
    await t.click(browserPage.submitButton);
    await t.expect(browserPage.notificationMessage.textContent).contains('No messages claimed', 'The message is not claimed notification');
    await t.expect(browserPage.streamMessage.count).eql(streamMessageBefore, 'The number of pendings in the table');
});
