import { Selector } from 'testcafe';

import { BaseNavigationPanel } from './navigation/base-navigation-panel';

export class NavigationPanel extends BaseNavigationPanel{
    workbenchButton = Selector('[data-testid=workbench-page-btn]');
    analysisPageButton = Selector('[data-testid=analytics-page-btn]');
    browserButton = Selector('[data-testid=browser-page-btn]');
    pubSubButton = Selector('[data-testid=pub-sub-page-btn]');

    triggeredFunctionsButton  = Selector('[data-testid=triggered-functions-page-btn]');
}
