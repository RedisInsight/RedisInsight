import { Selector } from 'testcafe';

import NotificationPanel from './navigation/notification-panel';
import { HelpCenter } from './navigation/help-center';

export class NavigationPanel {
    NotificationPanel = new NotificationPanel();
    HelpCenter  = new HelpCenter();

    workbenchButton = Selector('[data-testid=workbench-page-btn]');
    analysisPageButton = Selector('[data-testid=analytics-page-btn]');
    browserButton = Selector('[data-testid=browser-page-btn]');
    pubSubButton = Selector('[data-testid=pub-sub-page-btn]');
    myRedisDBButton = Selector('[data-test-subj=home-page-btn]', { timeout: 1000 });
    triggeredFunctionsButton  = Selector('[data-testid=triggered-functions-page-btn]');

    notificationCenterButton = Selector('[data-testid=notification-menu-button]');
    settingsButton = Selector('[data-testid=settings-page-btn]');
    helpCenterButton = Selector('[data-testid=help-menu-button]');
    githubButton = Selector('[data-testid=github-repo-icon]');
}
