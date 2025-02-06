import { Selector, t } from 'testcafe';

export class DatabaseOverview {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    cloudSignInButton = Selector('[data-testid=cloud-sign-in-btn]');
    databasesBackButton = Selector('[data-testid=my-redis-db-btn]');
    adminConsoleBackButton = Selector('[data-testid=admin-console-breadcrumb-btn]');
    copilotTriggerButton = Selector('[data-testid=copilot-trigger]');
    navInstancesPopoverButton = Selector('[data-testid=nav-instance-popover-btn]');
    userProfileButton = Selector('[data-testid=user-profile-btn]');
}
