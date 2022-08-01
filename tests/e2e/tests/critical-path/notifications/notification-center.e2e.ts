import { Chance } from 'chance';
import { acceptLicenseTerms } from '../../../helpers/database';
import { deleteAllNotificationsFromDB, insertNotificationInDB } from '../../../helpers/notifications';
import { commonUrl } from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { NotificationPage, MyRedisDatabasePage } from '../../../pageObjects';
import { NotificationParameters } from '../../../pageObjects/notification-page';

const notificationPage = new NotificationPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const chance = new Chance();
const notifications: NotificationParameters[] = [{notificationType: 'global', notificationTimestamp: Math.floor(Date.now() / 1000), notificationTitle: `Title: ${chance.paragraph({ sentences: 1 })}`, notificationBody: `Body: ${chance.paragraph({ sentences: 3 })}`, isNotificationRead: false},
    {notificationType: 'global', notificationTimestamp: Math.floor(Date.now() / 1000) + 1, notificationTitle: `Title: ${chance.paragraph({ sentences: 1 })}`, notificationBody: `Body: ${chance.paragraph({ sentences: 5 })}`, isNotificationRead: false}];
let sortedNotifications: NotificationParameters[] = [{notificationType: 'global', notificationTimestamp: 1558105316, notificationTitle: 'Title: 2019 year', notificationBody: `Body: ${chance.paragraph({ sentences: 1 })}`, isNotificationRead: false},
    {notificationType: 'global', notificationTimestamp: 1658935023, notificationTitle: 'Title: 27 July 2022', notificationBody: `Body: ${chance.paragraph({ sentences: 1 })}`, isNotificationRead: false}];
console.log(notifications[0].notificationTimestamp);
console.log(notifications[1].notificationTimestamp);

fixture.skip `Notification Center`
    .meta({ env: env.web, rte: rte.standalone, type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTerms();
        // Insert all needed notifications to DB
        await insertNotificationInDB(notifications);
        await t.eval(() => location.reload());
    })
    .afterEach(async() => {
        await deleteAllNotificationsFromDB();
    });
test
    .before(async() => {
        await acceptLicenseTerms();
    })('Verify that every time when notification manager publish notification.json file to latest, new message is displayed in the application', async t => {
        // Get number of notifications in the badge
        const newMessagesBeforeClosing = await notificationPage.getUnreadNotificationNumber();
        // Verify that user can see new notification in left popup
        await t.expect(notificationPage.notificationPopup.visible).ok('Notification popup is displayed', { timeout: 4000 });
        // Verify that new notification contains title, body and date
        await t.expect(notificationPage.notificationTitle.visible).ok('Title in popup is displayed');
        await t.expect(notificationPage.notificationBody.visible).ok('Body in popup is displayed');
        await t.expect(notificationPage.notificationDate.visible).ok('Date in popup is displayed');
        // Verify that user can click on close button and received notification will be closed
        await t.click(notificationPage.closeNotificationPopup);
        await t.expect(notificationPage.notificationPopup.visible).notOk('Notification popup is not displayed');
        // Verify that as soon as user closes notification center, unread messages become read
        if (notificationPage.notificationBadge.exists) {
            const newMessagesAfterClosing = await notificationPage.getUnreadNotificationNumber();
            await t.expect(newMessagesBeforeClosing).eql(newMessagesAfterClosing + 1);
        }
    });
test
    .before(async t => {
        await acceptLicenseTerms();
        await deleteAllNotificationsFromDB();
        await t.eval(() => location.reload());
    })('Verify that user can see message "No notifications to display." when no messages received', async t => {
        await t.click(notificationPage.notificationCenterButton);
        await t.expect(notificationPage.notificationCenterPanel.child().withExactText('Notification Center').visible).ok('Panel is opened');
        await t.expect(notificationPage.emptyNotificationMessage.child().withExactText('No notifications to display.').visible).ok('Empty message is displayed');
        // Verify that user can close notification center by clicking on any other area of the application
        await t.click(myRedisDatabasePage.searchInput);
        await t.expect(notificationPage.notificationCenterPanel.visible).notOk('Panel is not displayed');
    });
test('Verify that user can open notification center by clicking on icon and see all received messages', async t => {
    // Verify that user can see number of new notifications on notification center icon
    await t.expect(await notificationPage.getUnreadNotificationNumber()).eql(notifications.length, 'Number of unread messages in badge');
    // Verify that badge with number of unread notifications disappears when user opens notification center
    await t.click(notificationPage.notificationCenterButton);
    await t.expect(notificationPage.notificationBadge.exists).notOk('Badge disappears');
    // Verify that user can see unread messages by blue icon highlighting in notification center
    await t.expect(notificationPage.unreadNotification.count).eql(notifications.length, 'Highlighted messages');
    // Verify that user can see title, body, and received date of the message in notification center
    for (let i = 0; i < notifications.length; i++) {
        // Check date of the message
        await t.expect(notificationPage.notificationTitle.withExactText(notifications[i].notificationTitle).visible).ok('Displayed title');
        await t.expect(notificationPage.notificationBody.withExactText(notifications[i].notificationBody).visible).ok('Displayed body');
        await t.expect(notificationPage.notificationDate.withExactText(await notificationPage.convertEpochDateToMessageDate(sortedNotifications[i])).visible).ok('Displayed date');
    }
    // Verify that next time when users open notification center, highlighting is not displayed for those messages that were unread previous center opening
    await t.click(myRedisDatabasePage.browserButton); // Close notification center
    await t.click(notificationPage.notificationCenterButton);
    await t.expect(notificationPage.unreadNotification.exists).notOk('No unread notifications');
});
test
    .before(async t => {
        await acceptLicenseTerms();
        // Insert all needed notifications to DB
        await insertNotificationInDB(sortedNotifications);
        await t.eval(() => location.reload());
    })('Verify that all messages in notification center are sorted by timestamp from newest to oldest', async t => {
    // const actualList = [];
        sortedNotifications = sortedNotifications.sort((a, b) => a.notificationTimestamp < b.notificationTimestamp ? 1 : -1);
        for (let i = 0; i < sortedNotifications.length; i++) {
        // Get data from messages in the application
            const title = await notificationPage.notificationList.child(i).find(notificationPage.cssNotificationList).textContent;
            const body = await notificationPage.notificationList.child(i).find(notificationPage.cssNotificationList).textContent;
            const date = await notificationPage.notificationList.child(i).find(notificationPage.cssNotificationList).textContent;
            // Compare with what contained in sorted set
            await t.expect(title).eql(sortedNotifications[i].notificationTitle);
            await t.expect(body).eql(sortedNotifications[i].notificationBody);
            await t.expect(date).eql(await notificationPage.convertEpochDateToMessageDate(sortedNotifications[i]));
        }
    });
