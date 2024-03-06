import { Selector } from 'testcafe';
import { BaseNavigationPanel } from './base-navigation-panel';

export class RdiNavigationPanel extends BaseNavigationPanel{
    managementPageButton = Selector('[data-testid=pipeline-management-page-btn]');
    statusPageButton = Selector('[data-testid=pipeline-status-page-btn]');
}
