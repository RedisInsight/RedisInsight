import { acceptLicenseTerms } from '../../../helpers/database';
import { deleteAllNotificationsFromDB } from '../../../helpers/notifications';
import { commonUrl } from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { NotificationPage, MyRedisDatabasePage } from '../../../pageObjects';
import { NotificationParameters } from '../../../pageObjects/notification-page';
const description = require('./notifications.json');
const jsonNotifications: NotificationParameters[] = description.notifications;

const notificationPage = new NotificationPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

// Sort all notifications in json file
const sortedNotifications = jsonNotifications.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1);

fixture `Notifications`
    .meta({ rte: rte.none, type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
        await notificationPage.changeNotificationsSwitcher(true);
        await deleteAllNotificationsFromDB();
        await myRedisDatabasePage.reloadPage();
    });
test('Verify that when manager publishes new notification, it appears in the app', async t => {
    // Get number of notifications in the badge
    const newMessagesBeforeClosing = await notificationPage.getUnreadNotificationNumber();
    // Verify that user can see new notification in left popup
    // Verify that user can change notification toggle to on and new popup message will be displayed
    await t.expect(notificationPage.notificationPopup.visible).ok('Notification popup is displayed', { timeout: 4000 });
    // Verify that new notification contains title, body and date
    await t.expect(notificationPage.notificationTitle.visible).ok('Title in popup is displayed');
    await t.expect(notificationPage.notificationBody.visible).ok('Body in popup is displayed');
    await t.expect(notificationPage.notificationDate.visible).ok('Date in popup is displayed');
    // Verify that user can see notification with category badge and category color in a single notification
    await t.expect(notificationPage.notificationCategory.visible).ok('Category is not displayed in popup');
    if (sortedNotifications[0].category !== undefined) {
        await t.expect(notificationPage.notificationCategory.innerText).eql(sortedNotifications[0].category ?? '', 'Text for category is not correct');
        await t.expect(notificationPage.notificationCategory.withExactText(sortedNotifications[0].category ?? '').withAttribute('style', `background-color: rgb${sortedNotifications[0].rbgColor}; color: rgb(0, 0, 0);`).exists).ok('Category color');
    }
    // Verify that user can click on close button and received notification will be closed
    await t.click(notificationPage.closeNotificationPopup);
    await t.expect(notificationPage.notificationPopup.visible).notOk('Notification popup is not displayed');
    // Verify that when user closes new notification popup, number of unread messages decreased in badge
    if (await notificationPage.notificationBadge.exists) {
        const newMessagesAfterClosing = await notificationPage.getUnreadNotificationNumber();
        await t.expect(newMessagesBeforeClosing).eql(newMessagesAfterClosing + 1, 'Reduced number of unread messages');
    }
});
test('Verify that user can see message "No notifications to display." when no messages received', async t => {
    await t.click(notificationPage.notificationCenterButton);
    await t.expect(notificationPage.notificationCenterPanel.child().withExactText('Notification Center').visible).ok('Panel is opened');
    await t.expect(notificationPage.emptyNotificationMessage.child().withExactText('No notifications to display.').visible).ok('Empty message is displayed');
    // Verify that user can close notification center by clicking on any other area of the application
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    await t.expect(notificationPage.notificationCenterPanel.visible).notOk('Panel is not displayed');
    // Wait for new notification
    await t.expect(notificationPage.notificationPopup.exists).ok('New notifications appear', { timeout: 35000 });
    // Verify that user can open notification center by clicking on new received message popup
    await t.click(notificationPage.notificationPopup);
    await t.expect(notificationPage.notificationCenterPanel.visible).ok('Notification center is opened');
});
test('Verify that user can open notification center by clicking on icon and see all received messages', async t => {
    // Wait for new notifications
    await t.expect(notificationPage.notificationBadge.exists).ok('New notifications appear', { timeout: 35000 });
    // Verify that user can see number of new notifications on notification center icon
    await t.expect(await notificationPage.getUnreadNotificationNumber()).eql(jsonNotifications.length, 'Number of unread messages in badge');
    // Verify that badge with number of unread notifications disappears when user opens notification center
    await t.click(notificationPage.notificationCenterButton);
    await t.expect(notificationPage.notificationBadge.exists).notOk('Badge disappears');
    // Verify that user can see unread messages by blue icon highlighting in notification center
    await t.expect(notificationPage.unreadNotification.count).eql(jsonNotifications.length, 'Highlighted messages');
    // Verify that user can see title, body, and received date of the message in notification center
    for (let i = 0; i < jsonNotifications.length; i++) {
        // Check date of the message
        await t.expect(notificationPage.notificationTitle.withExactText(jsonNotifications[i].title).exists).ok('Displayed title');
        await t.expect(notificationPage.notificationBody.withExactText(jsonNotifications[i].body).exists).ok('Displayed body');
        await t.expect(notificationPage.notificationDate.withExactText(await notificationPage.convertEpochDateToMessageDate(jsonNotifications[i])).exists).ok('Displayed date');
        // Verify that user can see notification with category badge and category color in the notification center
        if (jsonNotifications[i].category !== undefined) {
            await t.expect(notificationPage.notificationCategory.withExactText(jsonNotifications[i].category ?? '').exists).ok(`${jsonNotifications[i].category} category name not displayed`);
            await t.expect(notificationPage.notificationCategory.withExactText(jsonNotifications[i].category ?? '').withAttribute('style', `background-color: rgb${jsonNotifications[i].rbgColor}; color: rgb(0, 0, 0);`).exists).ok('Category color');
        }
    }
    // Verify that as soon as user closes notification center, unread messages become read
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton); // Close notification center
    await t.expect(notificationPage.notificationBadge.exists).notOk('No unread messages badge');
    // Verify that next time when users open notification center, highlighting is not displayed for those messages that were unread previous center opening
    await t.click(notificationPage.notificationCenterButton); // Open notification center again
    await t.expect(notificationPage.unreadNotification.exists).notOk('No unread notifications');
});
test('Verify that all messages in notification center are sorted by timestamp from newest to oldest', async t => {
    // Wait for new notifications
    await t.expect(notificationPage.notificationBadge.exists).ok('New notifications appear', { timeout: 35000 });
    await t.click(notificationPage.notificationCenterButton);
    for (let i = 0; i < sortedNotifications.length; i++) {
        // Get data one by one from notification center
        const title = await notificationPage.notificationList.child(i).find(notificationPage.cssNotificationTitle).textContent;
        const body = await notificationPage.notificationList.child(i).find(notificationPage.cssNotificationBody).textContent;
        const date = await notificationPage.notificationList.child(i).find(notificationPage.cssNotificationDate).textContent;
        // Compare with what contained in sorted set
        await t.expect(title).eql(sortedNotifications[i].title, 'Title corresponds to sorted notification');
        await t.expect(body).eql(sortedNotifications[i].body, 'Body corresponds to sorted notification');
        await t.expect(date).eql(await notificationPage.convertEpochDateToMessageDate(sortedNotifications[i]), 'Date corresponds to sorted notification');
    }
});
test
    .before(async t => {
        await acceptLicenseTerms();
        await notificationPage.changeNotificationsSwitcher(false);
        await deleteAllNotificationsFromDB();
        await myRedisDatabasePage.reloadPage();
        await t.expect(notificationPage.notificationBadge.exists).notOk('No badge');
    })('Verify that new popup message is not displayed when notifications are turned off', async t => {
        // Verify that user can see notification badge increased when new messages is sent and notifications are turned off
        await t.expect(notificationPage.notificationBadge.exists).ok('New notifications appear', { timeout: 35000 });
        await t.expect(notificationPage.notificationPopup.exists).notOk('Popup is not displayed');
        // Verify that new messages is displayed only in notification center if notifications are turned off
        await t.click(notificationPage.notificationCenterButton);
        await t.expect(notificationPage.unreadNotification.count).eql(jsonNotifications.length, 'Unread notifications number');
    });
