import { Chance } from 'chance';
import { acceptLicenseTerms } from '../../../helpers/database';
import { deleteAllNotificationsFromDB, insertNotificationInDB } from '../../../helpers/notifications';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { addNewStandaloneDatabaseApi, deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { NotificationPage, MyRedisDatabasePage } from '../../../pageObjects';

const notificationPage = new NotificationPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const chance = new Chance();
const notifications: any[] = [['global', Date.now(), `Title: ${chance.paragraph({ sentences: 1 })}`, `Body: ${chance.paragraph({ sentences: 3 })}`, 0], ['global', Date.now() + 1, `Title2: ${chance.paragraph({ sentences: 1 })}`, `Body2: ${chance.paragraph({ sentences: 3 })}`, 0]];
let sortNotifications: any[] = [['global', 1558105316, 'Title: 2019 year', `Body: ${chance.paragraph({ sentences: 1 })}`, 0], ['global', 1658935023, 'Title: 27 July 2022', `Body: ${chance.paragraph({ sentences: 1 })}`, 0], ['global', 1658114023, 'Title: 18 July 2022', `Body: ${chance.paragraph({ sentences: 1 })}`, 0]];
console.log(`typeof paragraph:n ${typeof chance.paragraph({ sentences: 1 })}`);

fixture.skip `Notification Center`
    .meta({ env: env.web, rte: rte.standalone, type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await t.eval(() => location.reload());
    })
    .afterEach(async() => {
        await acceptLicenseTerms();
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .before(async t => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await t.eval(() => location.reload());
        await deleteAllNotificationsFromDB();
    })('Verify that user can see message "No notifications to display." when no messages received', async t => {
        await t.click(notificationPage.notificationCenterButton);
        await t.expect(notificationPage.notificationCenterPanel.child().withExactText('Notification Center').visible).ok('Panel is opened');
        await t.expect(notificationPage.emptyNotificationMessage.child().withExactText('No notifications to display.').visible).ok('Empty message is displayed');
        // Verify that user can close notification center by clicking on any other area of the application
        await t.click(myRedisDatabasePage.searchInput);
        await t.expect(notificationPage.notificationCenterPanel.visible).notOk('Panel is not displayed');
    });
test
    .before(async t => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await insertNotificationInDB(notifications);
        // To display badge with new notifications
        await t.eval(() => location.reload());
    })('Verify that user can open notification center by clicking on icon and see all received messages', async t => {
        // Verify that user can see number of new notifications on notification center icon
        await t.expect(parseInt(await notificationPage.notificationBadge.textContent)).eql(notifications.length, 'Number of unread messages in badge');
        // Verify that badge with number of unread notifications disappears when user opens notification center
        await t.click(notificationPage.notificationCenterButton);
        await t.expect(notificationPage.notificationBadge.exists).notOk('Badge disappears');
        // Verify that user can see unread messages by blue icon highlighting in notification center
        await t.expect(notificationPage.unreadNotification.count).eql(notifications.length, 'Highlighted messages');
        // Verify that user can see title, body, and received date of the message in notification center
        for (let i = 0; i < notifications.length; i++) {
            // Check date of the message
            const epochTimeConversion = notifications[i][1].toDateString();
            const dateToCompare = epochTimeConversion.substr(epochTimeConversion.indexOf(' ') + 1);
            await t.expect(notificationPage.notificationTitle.withExactText(notifications[i][2]).visible).ok('Displayed title');
            await t.expect(notificationPage.notificationBody.withExactText(notifications[i][3]).visible).ok('Displayed body');
            await t.expect(notificationPage.notificationDate.withExactText(dateToCompare).visible).ok('Displayed date');
        }
    });
test
    .before(async t => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await insertNotificationInDB(sortNotifications);
        await t.eval(() => location.reload());
    })('Verify that all messages in notification center are sorted by timestamp from newest to oldest', async() => {
        const actualList = [];
        sortNotifications = sortNotifications.sort((a, b) => b[1] - a[1]);
        for (let i = 0; i < sortNotifications.length; i++) {
            const title = await notificationPage.notificationList.child(i).find(notificationPage.cssNotificationList).textContent;
            const body = await notificationPage.notificationList.child(i).find(notificationPage.cssNotificationList).textContent;
            const date = await notificationPage.notificationList.child(i).find(notificationPage.cssNotificationList).textContent;
            actualList.push([title, body, date]);
            // await t.expect(title.eql(sortNotifications[i][2]));
        }
    });
