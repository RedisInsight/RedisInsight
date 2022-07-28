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
    //PANEL
    notificationCenterPanel = Selector('[data-testid=notification-center]');
    //TEXT ELEMENTS
    emptyNotificationMessage = Selector('[data-testid=no-notifications-text]');
    unreadNotification = Selector('[data-testid^=notification-item-unread]');
    notificationTitle = Selector('[data-testid=notification-title]');
    notificationBody = Selector('[data-testid=notification-body]');
    notificationDate = Selector('[data-testid=notification-date]');
    notificationList = Selector(this.cssNotificationList);
    //ICONS
    notificationBadge = Selector('[data-testid=total-unread-badge]');
}
