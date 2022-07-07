import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, PubSubPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const pubSubPage = new PubSubPage();


fixture `Subscribe/Unsubscribe from a channel`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .afterEach(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneBigConfig.databaseName);
    });
test
    .meta({ rte: rte.standalone })('Verify that user is unsubscribed from the pubsub channel when he go to the pubsub window after launching application for the first time', async t => {
        //Go to Pub/Sub page
        await t.click(myRedisDatabasePage.pubSubButton);
        //Verify that user is unsubscribed by default
        await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are not subscribed', 'User is not unsubscribed');
        await t.expect(pubSubPage.subscribeButton.textContent).eql('Subscribe', 'Subscribe button is not displayed');
    });
test
    .meta({ rte: rte.standalone })('Verify that when user subscribe to the pubsub channel he can see all the messages being published to my database from the moment of my subscription', async t => {
        //Go to Pub/Sub page
        await t.click(myRedisDatabasePage.pubSubButton);
        //Subscribe to chanel

        //Verify that user is unsubscribed by default
        await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are not subscribed', 'User is not unsubscribed');
        await t.expect(pubSubPage.subscribeButton.textContent).eql('Subscribe', 'Subscribe button is not displayed');
    });
