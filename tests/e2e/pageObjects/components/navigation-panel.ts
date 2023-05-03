import { Selector } from 'testcafe';

import NotificationPanel from './notification-panel';

export class NavigationPanel {
    NotificationPanel = new NotificationPanel();

    workbenchButton = Selector('[data-testid=workbench-page-btn]');
    analysisPageButton = Selector('[data-testid=analytics-page-btn]');
    browserButton = Selector('[data-testid=browser-page-btn]');
    pubSubButton = Selector('[data-testid=pub-sub-page-btn]');
    myRedisDBButton = Selector('[data-test-subj=home-page-btn]', { timeout: 1000 });

    notificationCenterButton = Selector('[data-testid=notification-menu-button]');
    settingsButton = Selector('[data-testid=settings-page-btn]');
    helpCenterButton = Selector('[data-testid=help-menu-button]');
    githubButton = Selector('[data-testid=github-repo-icon]');
}
