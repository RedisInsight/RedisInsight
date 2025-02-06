import { Selector } from 'testcafe';

import { BaseNavigationPanel } from './navigation/base-navigation-panel';

export class NavigationPanel extends BaseNavigationPanel{
    browserButton = Selector('[data-testid=browser-page-btn]');
    workbenchButton = Selector('[data-testid=workbench-page-btn]');
    analysisPageButton = Selector('[data-testid=analytics-page-btn]');
    pubSubButton = Selector('[data-testid=pub-sub-page-btn]');
    triggersAndFnsButton = Selector('[data-testid=triggered-functions-page-btn]')
    settingsButton = Selector('[data-testid=settings-page-btn]');
}
