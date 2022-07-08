import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, PubSubPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { Selector } from 'testcafe';

const myRedisDatabasePage = new MyRedisDatabasePage();
const pubSubPage = new PubSubPage();
const cliPage = new CliPage();

fixture `PubSub debug mode`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        //Go to PubSub page
        await t.click(myRedisDatabasePage.pubSubButton);
        await t.click(pubSubPage.subscribeButton);
        //Publish different messages
        await cliPage.sendCommandInCli(`10 publish chanel first`);
        await cliPage.sendCommandInCli(`10 publish chanel second`);
        await cliPage.sendCommandInCli(`10 publish chanel third`);
    })
    .afterEach(async () => {
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });

test.only
    .meta({ rte: rte.standalone })('Verify that when user navigating away and back to pubsub window the debug mode state will be reset to default auto-scroll', async t => {
        //Scroll to the first messages
        await t.scrollIntoView(pubSubPage.pubSubPageContainer.find('[data-testid^=row]').withText('first'));
        const scrollPosition = await Selector('[style*="position: relative"]:nth-child(1)').scrollTop;
        //Verify that new messages keep arriving in the background and user can always see up to date count of total messages received.
        await pubSubPage.publishMessage('test', 'message');
        await t.expect(pubSubPage.totalMessagesCount.textContent).contains('31', 'Total counter value is incorrect');
        //Verify that when user scroll away from the newest message the auto-scroll is stopped
        await t.expect(Selector('[style*="position: relative"]:nth-child(1)').scrollTop).eql(scrollPosition, 'The scroll position status');
        //Go to Browser Page
        await t.click(myRedisDatabasePage.myRedisDBButton);
        //Go to PubSub page
        await t.click(myRedisDatabasePage.pubSubButton);
        //Verify that the debug mode state is reset to default auto-scroll
        await t.expect(Selector('[style*="position: relative"]:nth-child(1)').scrollTop).notEql(scrollPosition, 'The scroll position status');
    });
test
    .meta({ rte: rte.standalone })('Verify that when user scroll all the way to the newest available message (down), auto-scroll resumes automatically.', async t => {
        //Scroll to the first messages
        await t.scrollIntoView(pubSubPage.pubSubPageContainer.find('[data-testid^=row]').withText('first'));
        await pubSubPage.publishMessage('test', 'message');
        await t.expect(pubSubPage.pubSubPageContainer.find('[data-testid^=row]').withText('message').exists).ok(`Message is not existed`, { timeout: 10000 });
        await t.scrollIntoView(pubSubPage.pubSubPageContainer.find('[data-testid^=row]').withText('message'));
        await cliPage.sendCommandInCli(`20 publish chanel fourth`);
        //Verify auto-scroll resumes automatically
        await t.expect(pubSubPage.pubSubPageContainer.find('[data-testid^=row]').withText('fourth').visible).ok(`Message is not visible`);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can get to the newest message in one click', async t => {
        //Scroll to the first messages
        await t.scrollIntoView(pubSubPage.pubSubPageContainer.find('[data-testid^=row]').withText('first'));
        await pubSubPage.publishMessage('test', 'message');
        await t.click(pubSubPage.scrollDownButton);
        //Verify the user scrolled to the newest message
        await t.expect(pubSubPage.pubSubPageContainer.find('[data-testid^=row]').withText('message').visible).ok(`The newest message is not visible`, { timeout: 5000 });
    });