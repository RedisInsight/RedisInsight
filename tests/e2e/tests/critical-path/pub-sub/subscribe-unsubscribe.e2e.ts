import { ClientFunction, t } from 'testcafe';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase, addNewStandaloneDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, PubSubPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossStandaloneV5Config } from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const pubSubPage = new PubSubPage();
const cliPage = new CliPage();
const verifyMessageDisplaying = async(message: string, displayed: boolean): Promise<void>  => {
    const messageByText = pubSubPage.pubSubPageContainer.find(pubSubPage.cssSelectorMessage).withText(message);
    displayed
        ? await t.expect(await messageByText.visible).ok(`"${message}" Message is not displayed`, { timeout: 5000 })
        : await t.expect(await messageByText.visible).notOk(`"${message}" Message is still displayed`);
};

fixture `Subscribe/Unsubscribe from a channel`
    .meta({ env: env.web, rte: rte.standalone, type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        //Go to PubSub page
        await t.click(myRedisDatabasePage.pubSubButton);
    })
    .afterEach(async() => {
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that user is unsubscribed from the pubsub channel when he go to the pubsub window after launching application for the first time', async t => {
    //Verify that the Channel field placeholder is 'Enter Channel Name'
    await t.expect(pubSubPage.channelNameInput.getAttribute('placeholder')).eql('Enter Channel Name', 'No placeholder in Channel field');
    //Verify that the Message field placeholder is 'Enter Message'
    await t.expect(pubSubPage.messageInput.getAttribute('placeholder')).eql('Enter Message', 'No placeholder in Message field');
    //Verify that user is unsubscribed by default
    await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are not subscribed', 'User is not unsubscribed');
    await t.expect(pubSubPage.subscribeButton.textContent).eql('Subscribe', 'Subscribe button is not displayed');
});
test('Verify that when user subscribe to the pubsub channel he can see all the messages being published to my database from the moment of my subscription', async t => {
    //Subscribe to channel
    await t.click(pubSubPage.subscribeButton);
    await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are  subscribed', 'User is not subscribed', { timeout: 10000 });
    //Verify that user can publish a message to a channel
    await pubSubPage.publishMessage('test', 'published message');
    await verifyMessageDisplaying('published message', true);
    await t.click(pubSubPage.unsubscribeButton);
    //Verify that when user unsubscribe from a pubsub channel he can see no new data being published to the channel from the moment he unsubscribe
    await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are not subscribed', 'User is not unsubscribed', { timeout: 10000 });
    //Verify that user can publish a message regardless of my subscription state.
    await pubSubPage.publishMessage('test', 'message in unsubscribed status');
    //Verify that message is not displayed
    await verifyMessageDisplaying('message in unsubscribed status', false);
});
test('Verify that my subscription state is preserved when user navigate through the app while connected to current database and in current app session', async t => {
    await pubSubPage.subsribeToChannelAndPublishMessage('test', 'message');
    //Go to Browser Page
    await t.click(myRedisDatabasePage.myRedisDBButton);
    //Go back to PubSub page
    await t.click(myRedisDatabasePage.pubSubButton);
    await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are  subscribed', 'User is not subscribed', { timeout: 10000 });
});
test('Verify that the focus gets always shifted to a newest message (auto-scroll)', async() => {
    await pubSubPage.subsribeToChannelAndPublishMessage('test', 'first message');
    //Publish 100 messages
    await cliPage.sendCommandInCli('100 publish channel test100Message');
    //Verify that the first message is not visible in view port
    await verifyMessageDisplaying('first message', false);
    await verifyMessageDisplaying('test100Message', true);
});
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Go to PubSub page
        await t.click(myRedisDatabasePage.pubSubButton);
    })
    .after(async() => {
        await deleteDatabase(ossStandaloneV5Config.databaseName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })('Verify that user subscription state is changed to unsubscribed, all the messages are cleared and total message counter is reset when user connect to another database', async t => {
        await t.click(pubSubPage.subscribeButton);
        //Publish 10 messages
        await cliPage.sendCommandInCli('10 publish channel message');
        await verifyMessageDisplaying('message', true);
        //Verify that user can see total number of messages received
        await t.expect(pubSubPage.totalMessagesCount.textContent).contains('10', 'Total counter value is incorrect');
        //Connect to second database
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
        //Verify no subscription, messages and total messages
        await t.click(myRedisDatabasePage.pubSubButton);
        await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are not subscribed', 'User is not unsubscribed', { timeout: 10000 });
        await verifyMessageDisplaying('message', false);
        await t.expect(pubSubPage.totalMessagesCount.exists).notOk('Total counter is still displayed');
    });
test('Verify that user can see a internal link to pubsub window under word “Pub/Sub” when he try to run PSUBSCRIBE command in CLI or Workbench', async t => {
    //Go to Browser Page
    await t.click(myRedisDatabasePage.browserButton);
    //Verify that user can see a custom message when he try to run PSUBSCRIBE command in CLI or Workbench: “Use Pub/Sub to see the messages published to all channels in your database”
    await cliPage.sendCommandInCli('PSUBSCRIBE');
    await t.click(cliPage.cliExpandButton);
    await t.expect(cliPage.cliWarningMessage.textContent).eql('Use Pub/Sub to see the messages published to all channels in your database.', 'Message is not displayed', { timeout: 10000 });
    //Verify internal link to pubsub page in CLI
    await t.expect(cliPage.cliLinkToPubSub.exists).ok('Link to pubsub page is not displayed');
    await t.click(cliPage.cliLinkToPubSub);
    await t.expect(pubSubPage.pubSubPageContainer.visible).ok('Pubsub page is opened');
});
test('Verify that when user click Publish and the publication is successful, he can see a response: badge with the number <# of clients received>', async t => {
    await pubSubPage.subsribeToChannelAndPublishMessage('test', 'message');
    await t.expect(pubSubPage.clientBadge.visible).ok('Client badge is not displayed');
    await t.expect(pubSubPage.clientBadge.textContent).eql('1', 'Client badge is not displayed', { timeout: 10000 });
});
test('Verify that the Message field input is preserved until user Publish a message', async t => {
    //Fill in Channel and Message inputs
    await t.click(pubSubPage.subscribeButton);
    await t.click(pubSubPage.channelNameInput);
    await t.typeText(pubSubPage.channelNameInput, 'testChannel', { replace: true });
    await t.click(pubSubPage.messageInput);
    await t.typeText(pubSubPage.messageInput, 'message', { replace: true });
    await t.expect(pubSubPage.messageInput.value).eql('message', 'Message input is empty', { timeout: 10000 });
    //Go to Browser Page
    await t.click(myRedisDatabasePage.myRedisDBButton);
    //Go to PubSub page
    await t.click(myRedisDatabasePage.pubSubButton);
    // Verify that message is preserved until publishing
    await t.expect(pubSubPage.messageInput.value).eql('message', 'Message input is empty', { timeout: 10000 });
    await t.click(pubSubPage.publishButton);
    await t.expect(pubSubPage.messageInput.value).eql('', 'Message input is empty', { timeout: 10000 });
    //Verify that the Channel field input is preserved until user modify it (publishing a message does not clear the field)
    await t.expect(pubSubPage.channelNameInput.value).eql('testChannel', 'Channel input is empty', { timeout: 10000 });
});
test('Verify that user can clear all the messages from the pubsub window', async t => {
    await pubSubPage.subsribeToChannelAndPublishMessage('testChannel', 'message');
    await pubSubPage.publishMessage('testChannel2', 'second m');
    //Verify the tooltip text 'Clear Messages' appears on hover the clear button
    await t.hover(pubSubPage.clearPubSubButton);
    await t.expect(pubSubPage.clearButtonTooltip.textContent).contains('Clear Messages', 'Clear Messages tooltip not displayed');
    await t.click(pubSubPage.clearPubSubButton);
    //Verify that the clear of the messages does not affect the subscription state
    await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are  subscribed', 'User is not subscribed', { timeout: 10000 });
    //Verify that the Messages counter is reset after clear messages
    await t.expect(pubSubPage.totalMessagesCount.textContent).contains('0', 'Total counter value is incorrect');
    //Verify messages are cleared
    await verifyMessageDisplaying('message', false);
    await verifyMessageDisplaying('second m', false);
});
