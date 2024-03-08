import { Selector } from 'testcafe';
import { BaseNavigationPanel } from './base-navigation-panel';

export class RdiNavigationPanel extends BaseNavigationPanel{
    statusPageButton = Selector('[data-testid=pipeline-status-page-btn]');
    managementPageButton = Selector('[data-testid=pipeline-management-page-btn]');
}
