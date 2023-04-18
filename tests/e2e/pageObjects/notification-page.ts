import { Selector, t } from 'testcafe';
import { SettingsPage } from './settings-page';
import { MyRedisDatabasePage } from './my-redis-databases-page';

const settingsPage = new SettingsPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

export class NotificationPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    // CSS Selectors
    cssNotificationList = '[data-testid=notifications-list]';
    cssNotificationTitle = '[data-testid=notification-title]';
    cssNotificationBody = '[data-testid=notification-body]';
    cssNotificationDate = '[data-testid=notification-date]';
    //BUTTONS
    notificationCenterButton = Selector('[data-testid=notification-menu-button]');
    closeNotificationPopup = Selector('[data-testid=close-notification-btn]');
    //PANEL
    notificationCenterPanel = Selector('[data-testid=notification-center]');
    notificationPopup = Selector('[data-testid=notification-popover]');
    //TEXT ELEMENTS
    emptyNotificationMessage = Selector('[data-testid=no-notifications-text]');
    unreadNotification = Selector('[data-testid^=notification-item-unread]');
    notificationTitle = Selector(this.cssNotificationTitle);
    notificationBody = Selector(this.cssNotificationBody);
    notificationDate = Selector(this.cssNotificationDate);
    notificationList = Selector(this.cssNotificationList);
    notificationCategory = Selector('[data-testid=notification-category]');
    //ICONS
    notificationBadge = Selector('[data-testid=total-unread-badge]', { timeout: 35000 });

    /**
     * Get number of unread messages from notification bell
     */
    async getUnreadNotificationNumber(): Promise<number> {
        return parseInt(await this.notificationBadge.textContent);
    }

    /**
     * Get number of unread messages from notification bell
     */
    async convertEpochDateToMessageDate(notification: NotificationParameters): Promise<string> {
        const epochTimeConversion = new Date(notification.timestamp * 1000).toDateString();
        const converted = epochTimeConversion.split(' ');
        return [converted[2], converted[1], converted[3]].join(' ');
    }

    /**
     * Turn on notifications in Settings
     */
    async changeNotificationsSwitcher(toValue: boolean): Promise<void> {
        await t
            .click(myRedisDatabasePage.NavigationPanel.settingsButton)
            .click(settingsPage.accordionAppearance);
        if (toValue === true) {
            if (await settingsPage.getNotificationsSwitcherValue() === 'false') {
                await t.click(settingsPage.switchNotificationsOption);
            }
        }
        if (toValue === false) {
            if (await settingsPage.getNotificationsSwitcherValue() === 'true') {
                await t.click(settingsPage.switchNotificationsOption);
            }
        }
    }
}
/**
 * Notification parameters
 * @param notificationType Type of notification
 * @param notificationDate Date of notification
 * @param notificationTitle Title of notification
 * @param notificationBody Text of notification
 * @param isNotificationRead Identification is message read
 */
export type NotificationParameters = {
    title: string,
    timestamp: number,
    body: string,
    type?: string,
    isRead?: boolean,
    category?: string,
    colorCategory?: string,
    rbgColor?: string
};
