import { Selector } from 'testcafe';

export class NotificationPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    // CSS Selectors
    cssNotificationList = '[data-testid=notifications-list]';
    //BUTTONS
    notificationCenterButton = Selector('[data-testid=notification-menu-button]');
    closeNotificationPopup = Selector('[data-testid=close-notification-btn]');
    //PANEL
    notificationCenterPanel = Selector('[data-testid=notification-center]');
    notificationPopup = Selector('[data-testid=notification-popover]');
    //TEXT ELEMENTS
    emptyNotificationMessage = Selector('[data-testid=no-notifications-text]');
    unreadNotification = Selector('[data-testid^=notification-item-unread]');
    notificationTitle = Selector('[data-testid=notification-title]');
    notificationBody = Selector('[data-testid=notification-body]');
    notificationDate = Selector('[data-testid=notification-date]');
    notificationList = Selector(this.cssNotificationList);
    //ICONS
    notificationBadge = Selector('[data-testid=total-unread-badge]');

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
        const epochTimeConversion = new Date(notification.notificationTimestamp).toDateString();
        return epochTimeConversion.substr(epochTimeConversion.indexOf(' ') + 1);
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
    notificationType: string,
    notificationTimestamp: number,
    notificationTitle: string,
    notificationBody: string,
    isNotificationRead: boolean
};
